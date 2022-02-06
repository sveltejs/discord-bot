import { build_embed } from '../utils/embed_helpers.js';
import { command } from 'jellycommands';

export default command({
	name: 'test',
	description: 'Testing that the bot works fine',

	global: true,
	dev: true,

	run: ({ interaction, client }) => {
		interaction.reply({
			embeds: [build_embed({ description: 'Hello World!' })],
		});
	},
});
