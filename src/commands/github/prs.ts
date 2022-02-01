import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { Repos } from '../../utils/repositories.js';
import { githubCommandHandler, GithubResultType } from './_common.js';

export default command({
	name: 'pr',
	description: 'Search for a pull request on github',
	global: true,

	options: [
		{
			name: 'repository',
			description: 'The repository to search within',
			type: ApplicationCommandOptionTypes.INTEGER,
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
			type: ApplicationCommandOptionTypes.STRING,
		},
	],

	run: async ({ interaction }) => {
		await githubCommandHandler(interaction, GithubResultType.PULL_REQUEST);
	},
});
