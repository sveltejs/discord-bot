import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { list_embed_builder } from './embed_helpers.js';
import { supabase } from '../db/supabase';

export async function get_tags_list(page_number: number) {
	const { data, error } = await supabase.rpc('get_tags_list', {
		page_number,
	});

	if (error || !data?.length) return null;

	const prev_button = new ButtonBuilder()
		.setLabel('Previous')
		.setCustomId(`tags_page_${page_number - 1}`)
		.setDisabled(page_number <= 1)
		.setStyle(ButtonStyle.Primary);

	const next_button = new ButtonBuilder()
		.setLabel('Next')
		.setCustomId(`tags_page_${page_number + 1}`)
		// @todo This is not robust, will give the wrong result when we have
		// exactly a multiple of 10 tags
		.setDisabled(data.length !== 10)
		.setStyle(ButtonStyle.Primary);

	const row = new ActionRowBuilder<ButtonBuilder>({
		components: [prev_button, next_button],
	});

	/** @todo Figure out a nice way to format these */
	const tags = data.map(
		(tag) => `\`${tag.tag_name.padEnd(32)}\` | <@${tag.author_id}>`,
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
