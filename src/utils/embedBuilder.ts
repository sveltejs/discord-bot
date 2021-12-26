import { MessageEmbed } from 'discord.js';
import { SVELTE_ORANGE } from '../config.js';

export function listOfLinks(links: string[], title?: string) {
	return new MessageEmbed({
		color: SVELTE_ORANGE,
		description: links.join('\n'),
		title,
	});
}
