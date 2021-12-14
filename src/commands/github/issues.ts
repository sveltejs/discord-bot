import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { REPOS } from '../../utils/repositories';
import { githubCommandHandler } from './_common';

const query = `query searchResults($searchQuery: String!) {
	search(type: ISSUE, query: $searchQuery, first: 5) {
		nodes {
			... on Issue {
				title
				number
				url
			}
		}
	}
}
`;

export default command({
	name: 'issue',
	description: 'Search for an issue on github',
	global: true,
	dev: true,

	options: [
		{
			name: 'repository',
			description: 'The repository to search within',
			type: ApplicationCommandOptionTypes.INTEGER,
			choices: [
				{
					name: 'Svelte',
					value: REPOS.SVELTE,
				},
				{
					name: 'SvelteKit',
					value: REPOS.SVELTEKIT,
				},
				{
					name: 'Language Tools',
					value: REPOS.LANGUAGETOOLS,
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
		await githubCommandHandler(interaction, query, 'issue');
	},
});
