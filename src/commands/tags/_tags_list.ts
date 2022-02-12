import { get_tags_list, NO_TAGS_FOUND } from '../../utils/tags.js';
import { TagCUDHandler } from './_common.js';

export const tag_list_handler: TagCUDHandler = async ({ interaction }) => {
	interaction.reply((await get_tags_list(1)) ?? NO_TAGS_FOUND);
};
