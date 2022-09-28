import { RouteBases, Routes } from 'discord.js';
import { command } from 'jellycommands';
import { get_member } from '../../utils/snowflake.js';
import { check_autothread_permissions } from '../../utils/threads.js';

const allowed_attempts_map = new Map<string, number>();

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
	run: async ({ interaction, client }) => {
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
				await thread.setArchived(true);
				await interaction.followUp('Thread archived');
				break;
			}

			case 'rename': {
				const new_name = interaction.options.getString('name', true);

				try {
					const next_allowed_attempt = allowed_attempts_map.get(
						thread.id,
					);

					if (
						next_allowed_attempt &&
						next_allowed_attempt * 1000 > Date.now()
					) {
						await interaction.followUp(
							`Your request is being rate limited by discord, you can make the request again <t:${next_allowed_attempt}:R>`,
						);
						return;
					}

					// Have to do a manual request because doing it through discord.js gets stuck until rate limits expire
					const res = await fetch(
						RouteBases.api + Routes.channel(thread.id),
						{
							body: JSON.stringify({
								name: new_name.slice(0, 100),
							}),
							method: 'PATCH',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bot ${client.token}`,
							},
						},
					);

					if (res.status === 429) {
						const retry_after = res.headers.get('retry-after')!;

						const timestamp =
							Math.trunc(Date.now() / 1000) + +retry_after;

						allowed_attempts_map.set(thread.id, timestamp);

						await interaction.followUp(
							`Your request is being rate limited by discord, you can make the request again <t:${timestamp}:R>`,
						);
						return;
					}

					await interaction.followUp('Thread renamed');
				} catch (error) {
					await interaction.followUp((error as Error).message);
				}
				break;
			}
		}
	},
});
