import { MessageEmbed, User } from 'discord.js';
import { SVELTE_ORANGE } from '../config.js';

export function list_embed_builder(list_items: string[], title?: string) {
	return new MessageEmbed({
		color: SVELTE_ORANGE,
		description: list_items.join('\n'),
		title,
	});
}

export function tags_embed_builder({
	tag_name,
	tag_content,
	author,
}: {
	tag_name: string;
	tag_content: string;
	author?: User;
}) {
	return new MessageEmbed({
		title: tag_name,
		description: tag_content,
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
