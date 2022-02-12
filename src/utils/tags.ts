import { MessageActionRow, MessageButton, MessageOptions } from 'discord.js';
import { Tag } from '../commands/tags/_common.js';
import { supabase } from '../db/index.js';
import { list_embed_builder } from './embed_helpers.js';

export async function get_tags_list(
	page_number: number,
): Promise<MessageOptions | null> {
	const { data, error } = await supabase.rpc<Tag>('get_tags_list', {
		page_number,
	});

	if (error || !data?.length) return null;

	const prev_button = new MessageButton()
		.setLabel('Previous')
		.setCustomId(`tags_page_${page_number - 1}`)
		.setDisabled(page_number <= 1)
		.setStyle('PRIMARY');

	const next_button = new MessageButton()
		.setLabel('Next')
		.setCustomId(`tags_page_${page_number + 1}`)
		// @todo This is not robust, will give the wrong result when we have
		// exactly a multiple of 10 tags
		.setDisabled(data.length !== 10)
		.setStyle('PRIMARY');

	const row = new MessageActionRow({
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
