import { check_autothread_permissions } from '../utils/threads.js';
import { build_embed } from '../utils/embed_helpers.js';
import { solve_thread } from '../utils/threads.js';
import { event } from 'jellycommands';

export default event({
	name: 'interactionCreate',

	run: async ({ client }, interaction): Promise<void> => {
		if (!interaction.isButton()) return;
		if (!interaction.channel?.isThread()) return;

		await interaction.deferReply();

		const thread = await interaction.channel.fetch();

		const member = await interaction.guild?.members.fetch(
			interaction.user.id,
		);

		const has_permission = await check_autothread_permissions(
			thread,
			member!,
		);

		if (!has_permission)
			return void interaction.followUp({
				content: "You don't have the permissions to manage this thread",
				ephemeral: true,
			});

		switch (interaction.customId) {
			case 'thread-solved':
				try {
					if (thread.name.startsWith('✅'))
						throw new Error('Thread already marked as solved');

					await solve_thread(thread, client, interaction.user);

					interaction.followUp({
						embeds: [
							build_embed({
								description: `Thread marked as solved! Thanks to ${interaction.user.toString()} for solving this issue.`,
							}),
						],
					});
				} catch (e) {
					interaction.followUp({
						embeds: [
							build_embed({
								description: (e as Error).message,
							}),
						],
					});
				}
				break;

			case 'thread-archive':
				if (thread.archived) {
					thread.setArchived(true).catch(() => {});
				}

				interaction.followUp({
					embeds: [
						build_embed({
							description: 'Thread Archived',
						}),
					],
				});
				break;
		}
	},
});
