import type { Repo } from '../../utils/repositories.ts';
import { github_command_handler } from './_common.ts';
import { command } from 'jellycommands';

export default command({
	name: 'pr',
	description: 'Search for a pull request on github',
	global: true,

	options: [
		{
			name: 'repository',
			description: 'The repository to search within',
			type: 'String',
			choices: [
				{
					name: 'Svelte',
					value: 'svelte' as const satisfies Repo,
				},
				{
					name: 'SvelteKit',
					value: 'sveltekit' as const satisfies Repo,
				},
				{
					name: 'RFCs',
					value: 'rfcs' as const satisfies Repo,
				},
				{
					name: 'Language Tools',
					value: 'language-tools' as const satisfies Repo,
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
		await github_command_handler(interaction, 'pull'),
});
