import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';

export default command({
	name: 'tutorial',
	description: 'Send a link to a svelte tutorial topic.',
	options: [
		{
			type: ApplicationCommandOptionTypes.STRING,
			description: 'The name of the tutorial.',
			name: 'topic',
			required: false,
		},
	],
	global: true,

	run: ({ interaction }) => {
		const topic = interaction.options.getString('topic');
		if (!topic) {
			interaction.reply({
				embeds: [
					{
						description: `Have you gone through the [Official Svelte Tutorial](https://svelte.dev/tutorial) yet?\n\
						It covers all you need to know to start using svelte.`,
						color: 0xff3e00,
					},
				],
			});
			return;
		}
	},
});
