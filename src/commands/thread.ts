import { command } from 'jellycommands';
import { HELP_CHANNELS, THREAD_ADMIN_IDS } from '../config.js';
import { build_embed } from '../utils/embed_helpers.js';
import { has_any_role_or_id } from '../utils/snowflake.js';
import { rename_thread } from '../utils/threads.js';

const undefined_on_error = async <T>(promise: Promise<T>) => {
	try {
		return await promise;
	} catch {
		return undefined;
	}
};

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

			options: [
				{
					name: 'user',
					description: 'Who helped you solve this thread?',
					type: 'STRING',
				},
			],
		},
	],

	global: true,
	defer: true,

	run: async ({ interaction }): Promise<void> => {
		const subcommand = interaction.options.getSubcommand(true);
		const thread = await interaction.channel?.fetch();

		if (thread?.isThread() && thread.archived)
			return void interaction.followUp({
				content: 'This thread is archived.',
				ephemeral: true,
			});

		const member = await interaction.guild?.members.fetch(
			interaction.user.id,
		);

		if (!member)
			return void interaction.followUp({
				content: 'Unable to find you',
				ephemeral: true,
			});

		if (!thread?.isThread())
			return void interaction.followUp({
				content: 'This channel is not a thread',
				ephemeral: true,
			});

		const allowed_ids = [...THREAD_ADMIN_IDS];

		// We assume this thread was auto threadded so the thread owner is the person who sent the start message
		const start_message = await undefined_on_error(
			thread.fetchStarterMessage(),
		);

		if (start_message) allowed_ids.push(start_message.author.id);

		// Thread owners can also archive/rename threads
		const thread_owner = await undefined_on_error(thread.fetchOwner());
		if (thread_owner) allowed_ids.push(thread_owner.id);

		if (!has_any_role_or_id(member, allowed_ids))
			return void interaction.followUp({
				content: "You don't have the permissions to manage this thread",
				ephemeral: true,
			});

		switch (subcommand) {
			case 'archive':
				await thread.setArchived(true);

				interaction.followUp({
					embeds: [
						build_embed({
							description: 'Thread archived',
						}),
					],
				});
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

					interaction.followUp({
						embeds: [
							build_embed({
								description: 'Thread renamed',
							}),
						],
					});
				} catch (error) {
					interaction.followUp({
						content: (error as Error).message,
					});
				}
				break;

			case 'solve':
				break;
		}
	},
});
