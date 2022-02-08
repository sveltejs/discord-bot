import { command } from 'jellycommands';
import { Repos } from '../../utils/repositories.js';
import { GithubResultType, github_command_handler } from './_common.js';

export default command({
	name: 'issue',
	description: 'Search for an issue on github',
	global: true,

	options: [
		{
			name: 'repository',
			description: 'The repository to search within',
			type: 'INTEGER',
			choices: [
				{
					name: 'Svelte',
					value: Repos.SVELTE,
				},
				{
					name: 'SvelteKit',
					value: Repos.SVELTE_KIT,
				},
				{
					name: 'Language Tools',
					value: Repos.LANGUAGE_TOOLS,
				},
			],
			required: true,
		},
		{
			name: 'topic',
			description: 'What to search for',
			type: 'STRING',
		},
	],

	run: async ({ interaction }) => {
		await github_command_handler(interaction, GithubResultType.ISSUE);
	},
});
