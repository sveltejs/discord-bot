import { SVELTE_ORANGE } from '../config.js';
import { command } from 'jellycommands';

export default command({
	name: 'test',
	description: 'Testing that the bot works fine',

	global: true,
	dev: true,

	run: ({ interaction, client }) => {
		interaction.reply({
			embeds: [{ description: 'Hello World!', color: SVELTE_ORANGE }],
		});
	},
});
