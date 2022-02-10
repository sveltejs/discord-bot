import { command } from 'jellycommands';
import { supabase } from '../../db/index.js';
import { build_embed, list_embed_builder } from '../../utils/embed_helpers.js';

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
					return void interaction.followUp('Something went wrong');

				if (!data)
					return void interaction.followUp({
						embeds: [
							build_embed({
								description: `<@${user_id}> has not solved any threads yet.`,
							}),
						],
					});

				return void interaction.followUp({
					embeds: [
						build_embed({
							description: `<@${user_id}> has solved ${data.count} threads. Thank you for your contribution.`,
						}),
					],
				});
			}

			case 'server': {
				const { data, error } = await supabase
					.from<ThreadSolvesTable>('leaderboard')
					.select('*');

				if (error || !data?.length)
					return void interaction.followUp('Could not fetch data');

				const leaderboard = data.map(
					({ user_id, count }) => `<@${user_id}>: ${count}`,
				);

				return void interaction.followUp({
					embeds: [
						list_embed_builder(leaderboard, 'Server leaderboard'),
					],
				});
			}
		}
	},
});

interface ThreadSolvesTable {
	user_id: string;
	count: number;
}
