import { Message } from 'discord.js';
import url_regex from 'url-regex';
import { LINK_ONLY_CHANNELS } from '../config';

export function fails_link_test(message: Message) {
	return (
		LINK_ONLY_CHANNELS.includes(message.channelId) &&
		!url_regex().test(message.content)
	);
}
