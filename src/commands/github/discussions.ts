import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { Repos } from '../../utils/repositories.js';
import { github_command_handler, GithubResultType } from './_common.js';

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
					value: Repos.SVELTE_KIT,
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
		await github_command_handler(interaction, GithubResultType.DISCUSSION);
	},
});
