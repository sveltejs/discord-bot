import { command } from 'jellycommands';
import { HELP_CHANNELS } from '../../config.js';
import { no_op } from '../../utils/promise.js';
import { RateLimitStore } from '../../utils/ratelimit.js';
import { get_member } from '../../utils/snowflake.js';
import {
	check_autothread_permissions,
	rename_thread,
} from '../../utils/threads.js';

/**
 * Discord allows 2 renames every 10 minutes.
 */
const rename_limit = new RateLimitStore(2, 10 * 60 * 1000);

export default command({
	name: 'thread',
	description: 'Manage a thread',

	options: [
		{
			name: 'archive',
			description: 'Archive a thread',
			type: 'Subcommand',
		},
		{
			name: 'rename',
			description: 'Rename a thread',
			type: 'Subcommand',

			options: [
				{
					name: 'name',
					description: 'The new name of the thread',
					type: 'String',
					required: true,
				},
			],
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
		}
	},
});
