import {
	GuildMember,
	MessageEmbed,
	MessageEmbedOptions,
	MessageOptions,
} from 'discord.js';
import { SVELTE_ORANGE } from '../config.js';

export const build_embed = (options: MessageEmbedOptions) =>
	new MessageEmbed({ color: SVELTE_ORANGE, ...options });

export function wrap_in_embed(
	content: string,
	embed_options?: MessageEmbedOptions,
): MessageOptions {
	const embed = build_embed(embed_options!);
	embed.setDescription(content);
	return { embeds: [embed] };
}

export function list_embed_builder(list_items: string[], title?: string) {
	return build_embed({
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
	author?: GuildMember;
}) {
	return build_embed({
		title: `\`${tag_name}\``,
		description: tag_content,
		author: author
			? {
					name: author.displayName,
					icon_url: author.displayAvatarURL({
						size: 64,
					}),
			  }
			: undefined,
	});
}
