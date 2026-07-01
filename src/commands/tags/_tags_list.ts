import { get_tags_list, NO_TAGS_FOUND } from '../../utils/tags.ts';
import type { TagCRUDHandler } from './_common.ts';

export const tag_list_handler: TagCRUDHandler = async ({ interaction }) => {
	return await interaction.reply((await get_tags_list(1)) ?? NO_TAGS_FOUND);
};
