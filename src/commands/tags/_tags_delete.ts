import { get_member, has_any_role_or_id } from '../../utils/snowflake.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { TAG_DEL_PERMITTED_IDS } from '../../config.js';
import { get_tag, TagCRUDHandler } from './_common.js';
import { supabase } from '../../db/supabase';

export const tag_delete_handler: TagCRUDHandler = async ({
	tag_name,
	interaction,
}) => {
	const tag = await get_tag(tag_name);

	if (!tag) {
		await interaction.reply({
			content: 'No tag with that name exists.',
			ephemeral: true,
		});
		return;
	}

	if (
		!has_any_role_or_id(await get_member(interaction), [
			tag.author_id,
			...TAG_DEL_PERMITTED_IDS,
		])
	) {
		await interaction.reply({
			content:
				"You don't have the permissions to delete that tag. You either have to be the author or a moderator.",
			ephemeral: true,
		});
		return;
	}

	if ((await supabase.from('tags').delete().eq('id', tag.id)).error) {
		await interaction.reply({
			content: `Failed to delete tag "${tag_name}".`,
			ephemeral: true,
		});
		return;
	}

	await interaction.reply({
		content: `Tag "${tag_name}" was successfully deleted.`,
		embeds: tags_embed_builder({
			tag_name,
			tag_content: tag.tag_content,
			author: await get_member(interaction, tag.author_id),
		}),
		ephemeral: true,
	});
};
