import { build_embed, wrap_in_embed } from '../../utils/embed_helpers.js';
import { pb } from '../../db/pocketbase';
import { command } from 'jellycommands';

export default command({
	name: 'stats',
	description: 'View stats about thread solves',

	options: [
		{
			name: 'personal',
			type: 'Subcommand',
			description: "View a particular user's stats",
			options: [
				{
					name: 'user',
					type: 'User',
					description:
						'The user to view stats for (omit for your own)',
				},
			],
		},
		{
			name: 'server',
			type: 'Subcommand',
			description: 'Server leaderboard',
		},
	],

	global: true,
	defer: true,
	disabled: true,

	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand(true);

		switch (subcommand) {
			case 'personal': {
				const user_id = (
					interaction.options.getUser('user') ?? interaction.user
				).id;

				const data = await pb
					.collection('threadSolves')
					.getFirstListItem(
						pb.filter('user_id = {:id}', {
							id: interaction.user.id,
						}),
					)
					.catch(() => null);

				if (!data) {
					await interaction.followUp('Something went wrong');
					return;
				}

				await interaction.followUp(
					wrap_in_embed(
						data.count
							? // prettier-ignore
								`<@${user_id}> has solved ${data.count} thread${data.count === 1 ? '' : 's'}. Thank you for your contribution.`
							: `<@${user_id}> has not solved any threads yet.`,
					),
				);
				return;
			}

			case 'server': {
				const data = await pb
					.collection('leaderboard')
					.getFullList()
					.catch(() => null);

				if (!data) {
					await interaction.followUp('Could not fetch data');
					return;
				}

				const leaderboard = build_embed({
					title: 'Server Leaderboard',
				}).addFields(
					{
						name: 'Member',
						value: data
							.map(({ user_id }) => `<@${user_id}>`)
							.join('\n'),
						inline: true,
					},
					{
						name: 'Solves',
						value: data
							.map(({ count }) => `${count} 🍪`)
							.join('\n'),
						inline: true,
					},
				);

				await interaction.followUp({
					embeds: [leaderboard],
				});
			}
		}
	},
});
