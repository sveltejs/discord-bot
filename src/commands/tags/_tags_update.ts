import { MessageActionRow, ModalActionRowComponent } from 'discord.js';
import { supabase } from '../../db/index.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { get_member } from '../../utils/snowflake.js';
import { get_tag, Tag, TagCRUDHandler } from './_common.js';

export const tag_update_handler: TagCRUDHandler = async ({
	interaction,
	tag_name,
}) => {
	const tag = await get_tag(tag_name);

	const fault = await (async () => {
		return !tag
			? 'No tag with that name exists. Did you mean to do `/tags create` instead?'
			: interaction.user.id !== tag.author_id
			? "You don't have the permissions to edit that tag. You have to be the author of the tag."
			: null;
	})();

	if (fault !== null || !tag /* Typescript ceremony */)
		return await interaction.reply({
			content: fault,
			ephemeral: true,
		});

	await interaction.showModal({
		title: `Updating tag: ${tag_name}`,
		customId: 'tag--modal',
		components: [
			new MessageActionRow<ModalActionRowComponent>().setComponents({
				type: 'TEXT_INPUT',
				customId: 'tag--modal__content',
				label: 'Content',
				maxLength: 2000,
				required: true,
				style: 'PARAGRAPH',
				value: tag.tag_content,
			}),
		],
	});

	let submission: Awaited<ReturnType<typeof interaction.awaitModalSubmit>>;
	try {
		submission = await interaction.awaitModalSubmit({
			filter: (i) => i.customId === 'tag--modal',
			time: 2 * 60 * 1000,
		});
	} catch {
		return;
	}

	const content = submission.fields.getTextInputValue('tag--modal__content');

	const { error } = await supabase
		.from<Tag>('tags')
		.update({ tag_content: content })
		.eq('id', tag.id);

	if (error) {
		return await submission.reply({
			content: `Failed to update tag "${tag_name}."`,
		});
	}

	await submission.reply({
		content: `Tag "${tag_name}" was successfully updated.`,
		embeds: [
			tags_embed_builder({
				tag_name,
				tag_content: content,
				author: await get_member(interaction, tag.author_id),
			}),
		],
	});
};
