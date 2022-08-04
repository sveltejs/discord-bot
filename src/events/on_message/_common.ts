import { Message } from 'discord.js';
import url_regex from 'url-regex';
import { LINK_ONLY_CHANNELS } from '../../config';

export function has_link(message: Message) {
	return url_regex().test(message.content);
}

export function fails_link_test(message: Message) {
	return in_link_only_channel(message) && !has_link(message);
}

export function in_link_only_channel(message: Message) {
	return LINK_ONLY_CHANNELS.includes(message.channelId);
}

export const STOP = Symbol();

export async function delete_message(m: Message, retried = 0) {
	if (retried >= 3 || !m.deletable) return;

	try {
		await m.delete();
	} catch {
		await delete_message(m, retried + 1);
	}
}
