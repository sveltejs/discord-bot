import { command } from 'jellycommands';
import { DEV_MODE } from '../config.js';
import { wrap_in_embed } from '../utils/embed_helpers.js';

export default command({
	name: 'test',
	description: 'Testing that the bot works fine',

	global: true,
	dev: true,
	disabled: !DEV_MODE,

	run: ({ interaction }) => {
		interaction.reply(wrap_in_embed('Hello world!'));
	},
});
