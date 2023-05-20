import { GithubResultType, github_command_handler } from './_common.js';
import { Repos } from '../../utils/repositories.js';
import { command } from 'jellycommands';

export default command({
	name: 'pr',
	description: 'Search for a pull request on github',
	global: true,

	options: [
		{
			name: 'repository',
			description: 'The repository to search within',
			type: 'Integer',
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
					name: 'RFCs',
					value: Repos.RFCS,
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
			type: 'String',
		},
	],

	run: async ({ interaction }) =>
		await github_command_handler(
			interaction,
			GithubResultType.PULL_REQUEST,
		),
});
