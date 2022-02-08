import { command } from 'jellycommands';
import { DEV_MODE } from '../config.js';
import { build_embed } from '../utils/embed_helpers.js';

export default command({
	name: 'test',
	description: 'Testing that the bot works fine',

	global: true,
	dev: true,
	disabled: !DEV_MODE,

	run: ({ interaction, client }) => {
		interaction.reply({
			embeds: [build_embed({ description: 'Hello World!' })],
		});
	},
});
