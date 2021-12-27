import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { REPOS } from '../../utils/repositories.js';
import { githubCommandHandler } from './_common.js';

const query = `query searchResults($searchQuery: String!) {
	search(type: DISCUSSION, query: $searchQuery, first: 5) {
		nodes {
			... on Discussion {
				title
				number
				url
			}
		}
	}
}
`;

export default command({
	name: 'discussion',
	description: 'Search for a discussion on github.',
	global: true,

	options: [
		{
			name: 'repository',
			description: 'The repository to search within',
			type: ApplicationCommandOptionTypes.INTEGER,
			choices: [
				{
					name: 'SvelteKit',
					value: REPOS.SVELTEKIT,
				},
			],
			required: true,
		},
		{
			name: 'topic',
			description: 'What to search for',
			type: ApplicationCommandOptionTypes.STRING,
		},
	],

	run: async ({ interaction }) => {
		await githubCommandHandler(interaction, query);
	},
});
