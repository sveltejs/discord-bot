import { event } from 'jellycommands';
import urlRegex from 'url-regex';

import {
	AUTO_THREAD_CHANNELS,
	LINK_ONLY_CHANNELS,
	SVELTE_ORANGE,
} from '../config';

export default event({
	name: 'messageCreate',

	run: async ({}, message) => {
		if (message.author.bot) return;

		if (LINK_ONLY_CHANNELS.includes(message.channel.id)) {
			const hasLink = urlRegex().test(message.content);

			if (!hasLink) {
				try {
					if (message.deletable) await message.delete();

					await message.author.send({
						embeds: [
							{
								description: `Your message in ${message.channel.toString()} was removed since it doesn't contain a link, if you are trying to showcase a project please post a link with your text. Otherwise all conversation should be inside a thread\n\nYour message was sent below so you don't lose it!`,
								color: SVELTE_ORANGE,
							},
						],
					});

					await message.author.send({
						content: message.content,
					});
				} catch {
					// this will fail if message is already deleted but we don't know or if the dm can't be sent - either way we don't need to do anything
				}

				return;
			}
		}

		if (
			AUTO_THREAD_CHANNELS.includes(message.channel.id) &&
			!message.hasThread &&
			message.channel.type == 'GUILD_TEXT'
		) {
			try {
				message.channel.threads.create({
					name: 'Discussion',
					startMessage: message,
				});
			} catch {
				// we can ignore this error since chances are it will be that thread already exists
			}
		}
	},
});
