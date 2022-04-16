import { event } from 'jellycommands';
import url_regex from 'url-regex';
import { LINK_ONLY_CHANNELS } from '../config.js';
import { wrap_in_embed } from '../utils/embed_helpers.js';

export default event({
	name: 'messageCreate',

	run: async ({}, message) => {
		if (message.author.bot) return;

		if (LINK_ONLY_CHANNELS.includes(message.channel.id)) {
			const has_link = url_regex().test(message.content);

			if (!has_link) {
				if (message.deletable) await message.delete();

				await message.author.send(
					wrap_in_embed(
						`Your message in ${message.channel.toString()} was removed since it doesn't contain a link, if you are trying to showcase a project please post a link with your text. Otherwise all conversation should be inside a thread\n\nYour message was sent below so you don't lose it!`,
					),
				);

				await message.author.send(message.content);
			}
		}
	},
});
