import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { list_embed_builder } from './embed_helpers.js';
import { pb } from '../db/pocketbase.js';

export async function get_tags_list(page_number: number) {
	const { items, totalPages } = await pb
		.collection('tags')
		.getList(page_number, 10);

	const prev_button = new ButtonBuilder()
		.setLabel('Previous')
		.setCustomId(`tags_page_${page_number - 1}`)
		.setDisabled(page_number <= 1)
		.setStyle(ButtonStyle.Primary);

	const next_button = new ButtonBuilder()
		.setLabel('Next')
		.setCustomId(`tags_page_${page_number + 1}`)
		.setDisabled(page_number == totalPages)
		.setStyle(ButtonStyle.Primary);

	const row = new ActionRowBuilder<ButtonBuilder>({
		components: [prev_button, next_button],
	});

	/** @todo Figure out a nice way to format these */
	const tags = items.map(
		(tag) => `\`${tag.name.padEnd(32)}\` | <@${tag.author_id}>`,
	);

	return {
		components: [row],
		embeds: [list_embed_builder(tags, `Page ${page_number}`)],
	};
}

export const NO_TAGS_FOUND = {
	content: 'No tags found',
	ephemeral: true,
};
