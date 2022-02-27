import { TAG_DEL_PERMITTED_IDS } from '../../config.js';
import { supabase } from '../../db/index.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { get_member, has_any_role_or_id } from '../../utils/snowflake.js';
import { get_tag, Tag, TagCRUDHandler } from './_common.js';

export const tag_delete_handler: TagCRUDHandler = async ({
	tag_name,
	interaction,
}) => {
	const tag = await get_tag(tag_name);

	if (!tag) {
		return interaction.reply({
			content: 'No tag with that name exists.',
			ephemeral: true,
		});
	}

	const member = (await get_member(interaction))!;
	if (
		!has_any_role_or_id(member, [tag.author_id, ...TAG_DEL_PERMITTED_IDS])
	) {
		return interaction.reply({
			content:
				"You don't have the permissions to delete that tag. You either have to be the author or a moderator.",
			ephemeral: true,
		});
	}

	if ((await supabase.from<Tag>('tags').delete().eq('id', tag.id)).error) {
		return interaction.reply({
			content: `Failed to delete tag "${tag_name}".`,
			ephemeral: true,
		});
	}

	await interaction.reply({
		content: `Tag "${tag_name}" was successfully deleted.`,
		embeds: [
			tags_embed_builder({
				tag_name,
				tag_content: tag.tag_content,
				author: await get_member(interaction, tag.author_id),
			}),
		],
		ephemeral: true,
	});
};
