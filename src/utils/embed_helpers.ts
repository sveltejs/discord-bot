import { GuildMember, EmbedBuilder, EmbedData } from 'discord.js';
import { SVELTE_ORANGE } from '../config.js';

export const build_embed = (options: EmbedData) =>
	new EmbedBuilder({ color: SVELTE_ORANGE, ...options });

export function wrap_in_embed(content: string, ephemeral?: boolean) {
	const embed = build_embed({ description: content });
	return { embeds: [embed], ephemeral };
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
	return [
		build_embed({
			title: `\`${tag_name}\``,
			description: tag_content,
			footer: author && {
				text: `Created by ${author.displayName}`,
				iconURL: author.displayAvatarURL({
					size: 64,
				}),
			},
		}),
	];
}
