import { command } from 'jellycommands';
import { HELP_CHANNELS } from '../../config.js';
import { build_embed } from '../../utils/embed_helpers.js';
import {
	check_autothread_permissions,
	get_ending_message,
	rename_thread,
	solve_thread,
} from '../../utils/threads.js';
import { get_member } from '../tags/_common.js';

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
	],

	global: true,
	defer: {
		ephemeral: true,
	},

	run: async ({ interaction }): Promise<void> => {
		const subcommand = interaction.options.getSubcommand(true);
		const thread = await interaction.channel?.fetch();

		if (!thread?.isThread())
			return void interaction.followUp('This channel is not a thread');

		/**
		 * @todo This doesn't seem to work, creating an interaction
		 * in an archived thread probably unarchives it.
		 */
		if (thread.archived)
			return void interaction.followUp('This thread is archived.');

		const member = await get_member(interaction, interaction.user.id);

		if (!member) return void interaction.followUp('Unable to find you');

		const has_permission = await check_autothread_permissions(
			thread,
			member,
		);

		if (!has_permission)
			return void interaction.followUp(
				"You don't have the permissions to manage this thread",
			);

		switch (subcommand) {
			case 'archive':
				await thread.setArchived(true);

				interaction.followUp('Thread archived');
				break;

			case 'rename':
				const new_name = interaction.options.getString('name', true);
				const parent_id = thread.parentId || '';

				try {
					await rename_thread(
						thread,
						new_name,
						HELP_CHANNELS.includes(parent_id),
					);

					interaction.followUp('Thread renamed');
				} catch (error) {
					interaction.followUp((error as Error).message);
				}
				break;

			case 'solve':
				try {
					if (thread.name.startsWith('✅'))
						throw new Error('Thread already marked as solved');

					if (!HELP_CHANNELS.includes(thread.parentId || ''))
						throw new Error(
							'This command only works in a auto thread',
						);

					await solve_thread(thread);

					interaction.channel?.send({
						embeds: [
							build_embed({
								description:
									'Thread solved. Thank you everyone.',
							}),
						],
					});

					interaction.followUp(
						await get_ending_message(thread, interaction.user.id),
					);
				} catch (e) {
					interaction.followUp((e as Error).message);
				}
				break;
		}
	},
});
