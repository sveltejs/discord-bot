import { command } from 'jellycommands';
import { HELP_CHANNELS } from '../../config.js';
import { wrap_in_embed } from '../../utils/embed_helpers.js';
import { RateLimitStore } from '../../utils/ratelimit.js';
import { get_member } from '../../utils/snowflake.js';
import {
	add_thread_prefix,
	check_autothread_permissions,
	get_ending_message,
	rename_thread,
	solve_thread,
} from '../../utils/threads.js';
import { no_op } from '../../utils/promise.js';

/**
 * Discord allows 2 renames every 10 minutes. We need one always available
 * for the solve command, so only one rename per 10 minutes is allowed for users.
 */
const rename_limit = new RateLimitStore(1, 10 * 60 * 1000);

/*
 * This is mostly just to prevent abuse. We could reuse the rename limit but
 * highly unlikely it'll be legitimately closed and then reopened multiple
 * times in the same day.
 */
const reopen_limit = new RateLimitStore(1, 1440 * 60 * 1000);

export default command({
	name: 'thread',
	description: 'Manage a thread',

	options: [
		{
			name: 'archive',
			description: 'Archive a thread',
			type: 'SUB_COMMAND',
		},
		{
			name: 'rename',
			description: 'Rename a thread',
			type: 'SUB_COMMAND',

			options: [
				{
					name: 'name',
					description: 'The new name of the thread',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'solve',
			description: 'Mark a thread as solved',
			type: 'SUB_COMMAND',
		},
		{
			name: 'reopen',
			description: 'Reopen a solved thread',
			type: 'SUB_COMMAND',
		},
	],

	global: true,
	defer: {
		ephemeral: true,
	},

	// @ts-expect-error
	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand(true);
		const thread = await interaction.channel?.fetch();

		if (!thread?.isThread())
			return await interaction.followUp('This channel is not a thread');

		const member = await get_member(interaction);

		if (!member) return await interaction.followUp('Unable to find you');

		const has_permission = await check_autothread_permissions(
			thread,
			member,
		);

		if (!has_permission)
			return await interaction.followUp(
				"You don't have the permissions to manage this thread",
			);

		switch (subcommand) {
			case 'archive': {
				await thread.setArchived(true).catch(no_op);

				await interaction.followUp('Thread archived');
				break;
			}

			case 'rename': {
				const new_name = interaction.options.getString('name', true);
				const parent_id = thread.parentId || '';

				try {
					if (rename_limit.is_limited(thread.id, true))
						return await interaction.followUp(
							'You can only rename a thread once every 10 minutes',
						);

					await rename_thread(
						thread,
						new_name,
						HELP_CHANNELS.includes(parent_id),
					);

					await interaction.followUp('Thread renamed');
				} catch (error) {
					await interaction.followUp((error as Error).message);
				}
				break;
			}

			case 'solve': {
				try {
					if (thread.name.startsWith('✅'))
						throw new Error('Thread already marked as solved');

					if (!HELP_CHANNELS.includes(thread.parentId || ''))
						throw new Error(
							'This command only works in a auto thread',
						);

					await solve_thread(thread);

					await Promise.allSettled([
						thread.send(
							wrap_in_embed('Thread solved. Thank you everyone.'),
						),
						get_ending_message(thread, interaction.user.id).then(
							(m) => interaction.followUp(m),
						),
					]);
				} catch (e) {
					await interaction.followUp((e as Error).message);
				}
				break;
			}

			case 'reopen':
				try {
					if (!thread.name.startsWith('✅'))
						throw new Error("Thread's not marked as solved");

					if (!HELP_CHANNELS.includes(thread.parentId || ''))
						throw new Error(
							'This command only works in a auto thread',
						);

					if (reopen_limit.is_limited(thread.id, true))
						throw new Error(
							'You can only reopen a thread once every 24 hours',
						);
					if (rename_limit.is_limited(thread.id, true))
						throw new Error(
							"You'll have to wait at least 10 minutes from when you renamed the thread to reopen it.",
						);

					await thread.edit({
						name: add_thread_prefix(thread.name, false).slice(
							0,
							100,
						),
						autoArchiveDuration: 1440,
					});

					await interaction.followUp('Thread reopened.');
				} catch (e) {
					await interaction.followUp((e as Error).message);
				}
				break;
		}
	},
});
