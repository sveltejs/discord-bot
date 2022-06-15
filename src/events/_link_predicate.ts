import { Message } from 'discord.js';
import url_regex from 'url-regex';
import { LINK_ONLY_CHANNELS } from '../config';

export function fails_link_test(message: Message) {
	return in_link_only_channel(message) && !url_regex().test(message.content);
}

export function in_link_only_channel(message: Message) {
	return LINK_ONLY_CHANNELS.includes(message.channelId);
}
