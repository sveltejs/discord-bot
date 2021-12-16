import { MessageEmbed } from 'discord.js';
import { SVELTE_ORANGE } from '../config.js';

export function listOfLinks(links: string[], title?: string) {
	return new MessageEmbed({
		color: SVELTE_ORANGE,
		description: links.join('\n'),
		title,
	});
}

export function tagsEmbedBuilder({
	tagName,
	tagContent,
	author,
}: {
	tagName: string;
	tagContent: string;
	author?: User;
}) {
	return new MessageEmbed({
		title: tagName,
		description: tagContent,
		author: author
			? {
					name: author.tag,
					icon_url: author.displayAvatarURL({
						size: 64,
					}),
			  }
			: undefined,
		color: SVELTE_ORANGE,
	});
}
