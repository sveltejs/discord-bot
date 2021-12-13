import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { REPOS, REPO_DETAILS } from '../../utils/repositories';
import githubSearch from './_githubGQL';

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
	dev: true,

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
		const thisRepoDetails =
			REPO_DETAILS[
				interaction.options.getInteger('repository', true) as REPOS
			];
		const topic = interaction.options.getString('topic');

		const searchQuery = `repo:${thisRepoDetails.REPOSITORY_NAME} ${
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
