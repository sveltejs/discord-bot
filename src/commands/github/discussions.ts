import type { Repo } from '../../utils/repositories.ts';
import { github_command_handler } from './_common.js';
import { command } from 'jellycommands';

export default command({
	name: 'discussion',
	description: 'Search for a discussion on github.',
	global: true,

	options: [
		{
			name: 'repository',
			description: 'The repository to search within',
			type: 'String',
			choices: [
				{
					name: 'SvelteKit',
					value: 'sveltekit' as const satisfies Repo,
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
		await github_command_handler(interaction, 'discussion'),
});
