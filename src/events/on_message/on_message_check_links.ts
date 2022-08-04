import { event } from 'jellycommands';
import { wrap_in_embed } from '../../utils/embed_helpers.js';
import { fails_link_test } from './_common.js';

export default event({
	name: 'messageCreate',

	run: async ({}, message) => {
		if (message.author.bot) return;

		if (fails_link_test(message)) {
			if (message.deletable) await message.delete();

			await message.author.send(
				wrap_in_embed(
					`Your message in ${message.channel} was removed since it doesn't contain a link, if you are trying to showcase a project please post a link with your text. Otherwise all conversation should be inside a thread\n\nYour message was sent below so you don't lose it!`,
				),
			);

			await message.author.send(message.content);
		}
	},
});
