import { command } from 'jellycommands';
import { SVELTE_ORANGE } from '../config';

export default command({
	name: 'test',
	description: 'Testing that the bot works fine',

	global: true,
	dev: true,

	run: ({ interaction }) =>
		interaction.reply({
			embeds: [{ description: 'Hello World!', color: SVELTE_ORANGE }],
		}),
});
