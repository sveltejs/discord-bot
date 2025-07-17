import { LINK_ONLY_CHANNELS } from '../../config';
import { setTimeout } from 'node:timers/promises';
import type { Message } from 'discord.js';
import url_regex from 'url-regex';

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

export async function delete_message(message: Message, retries = 3) {
	// biome-ignore lint/style/noParameterAssign: todo
	while (--retries && message.deletable) {
		try {
			await message.delete();
			return;
		} catch {
			await setTimeout(1_000);
		}
	}
}
