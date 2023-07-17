import { GithubResultType, github_command_handler } from './_common.js';
import { Repos } from '../../utils/repositories.js';
import { command } from 'jellycommands';

export default command({
	name: 'discussion',
	description: 'Search for a discussion on github.',
	global: true,

	options: [
		{
			name: 'repository',
			description: 'The repository to search within',
			type: 'Integer',
			choices: [
				{
					name: 'SvelteKit',
					value: Repos.SVELTE_KIT,
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
		await github_command_handler(interaction, GithubResultType.DISCUSSION),
});
