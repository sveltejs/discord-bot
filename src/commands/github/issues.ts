import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { REPOS, REPO_DETAILS } from '../../utils/repositories';
import githubSearch from './_githubGQL';

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
		const thisRepoDetails =
			REPO_DETAILS[
				interaction.options.getInteger('repository', true) as REPOS
			];
		const topic = interaction.options.getString('topic');

		const searchQuery = `is:issue repo:${thisRepoDetails.REPOSITORY_NAME} ${
			topic || ''
		}`;

		let results = await githubSearch({
			query,
			variables: {
				searchQuery,
			},
		});

		if (results) {
			await interaction.reply({
				embeds: [results],
			});
		} else {
			await interaction.reply({
				content: 'No results found.',
				ephemeral: true,
			});
		}
	},
});
