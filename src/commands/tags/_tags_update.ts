import { i_solemnly_swear_it_is_not_null } from '../../utils/smh_typescript.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { get_tag, type TagCRUDHandler } from './_common.js';
import { get_member } from '../../utils/snowflake.js';

import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { pb } from '../../db/pocketbase.js';

export const tag_update_handler: TagCRUDHandler = async ({
	interaction,
	tag_name,
}) => {
	const tag = await get_tag(tag_name);

	const fault = !tag
		? 'No tag with that name exists. Did you mean to do `/tags create` instead?'
		: interaction.user.id !== tag.author_id
			? "You don't have the permissions to edit that tag. You have to be the author of the tag."
			: null;

	if (fault !== null) {
		await interaction.reply({
			content: fault,
			ephemeral: true,
		});
		return;
	}

	/* @__PURE__ */ i_solemnly_swear_it_is_not_null(tag);

	await interaction.showModal(
		new ModalBuilder()
			.setTitle(`Updating tag: ${tag_name}`)
			.setCustomId('tag--modal')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setStyle(TextInputStyle.Paragraph)
						.setCustomId('tag--modal__content')
						.setLabel('Content')
						.setMaxLength(2000)
						.setRequired(true)
						.setValue(tag.content),
				),
			),
	);

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

	const result = await pb
		.collection('tags')
		.update(tag.id, { content })
		.catch(() => false);

	await submission.reply(
		!result
			? {
					content: `Failed to update tag "${tag_name}."`,
				}
			: {
					content: `Tag "${tag_name}" was successfully updated.`,
					embeds: tags_embed_builder({
						tag_name,
						tag_content: content,
						author: await get_member(interaction, tag.author_id),
					}),
				},
	);
};
