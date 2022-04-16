import { command } from 'jellycommands';
import { SVELTE_COIN_EMOJI } from '../../config.js';
import { supabase } from '../../db/index.js';
import { build_embed } from '../../utils/embed_helpers.js';

export default command({
	name: 'stats',
	description: 'View stats about thread solves',

	options: [
		{
			name: 'personal',
			type: 'SUB_COMMAND',
			description: "View a particular user's stats",
			options: [
				{
					name: 'user',
					type: 'USER',
					description:
						'The user to view stats for (omit for your own)',
				},
			],
		},
		{
			name: 'server',
			type: 'SUB_COMMAND',
			description: 'Server leaderboard',
		},
	],

	global: true,
	defer: true,
	disabled: true,

	// @ts-expect-error
	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand(true);

		switch (subcommand) {
			case 'personal': {
				const user_id = (
					interaction.options.getUser('user') ?? interaction.user
				).id;

				const { data, error } = await supabase
					.from<ThreadSolvesTable>('thread_solves')
					.select('count')
					.eq('user_id', user_id)
					.maybeSingle();

				if (error)
					return await interaction.followUp('Something went wrong');

				if (!data)
					return await interaction.followUp({
						embeds: [
							build_embed({
								description: `<@${user_id}> has not solved any threads yet.`,
							}),
						],
					});

				return await interaction.followUp({
					embeds: [
						build_embed({
							// prettier-ignore
							description: `<@${user_id}> has solved ${data.count} thread${data.count === 1 ? '' : 's'}. Thank you for your contribution.`,
						}),
					],
				});
			}

			case 'server': {
				const { data, error } = await supabase
					.from<ThreadSolvesTable>('leaderboard')
					.select('*');

				if (error || !data?.length)
					return await interaction.followUp('Could not fetch data');

				const leaderboard = build_embed({
					title: 'Server Leaderboard',
				})
					.addField(
						'Member',
						data.map(({ user_id }) => `<@${user_id}>`).join('\n'),
						true,
					)
					.addField(
						'Solves',
						data
							.map(({ count }) => `${count} ${SVELTE_COIN_EMOJI}`)
							.join('\n'),
						true,
					);

				return await interaction.followUp({
					embeds: [leaderboard],
				});
			}
		}
	},
});

interface ThreadSolvesTable {
	user_id: string;
	count: number;
}
