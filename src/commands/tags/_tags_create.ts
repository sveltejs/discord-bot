import { get_member, has_any_role_or_id } from '../../utils/snowflake.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { TAG_CREATE_PERMITTED_IDS } from '../../config.js';
import { get_tag, TagCRUDHandler } from './_common.js';
import { supabase } from '../../db/supabase';

import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

const validator_regex = /^[a-z0-9\-\+\_\.\ ]*$/;

export const tag_create_handler: TagCRUDHandler = async ({
	interaction,
	tag_name,
}) => {
	const member = (await get_member(interaction))!;

	const fault = !has_any_role_or_id(member, TAG_CREATE_PERMITTED_IDS)
		? "You don't have the permissions to create a tag."
		: !validator_regex.test(tag_name)
			? `The name provided isn't valid. It must match \`${validator_regex.source}\``
			: (await get_tag(tag_name))
				? 'A tag with that name exists already. Did you mean to do `/tags update` instead?'
				: null;

	if (fault !== null) {
		await interaction.reply({
			content: fault,
			ephemeral: true,
		});
		return;
	}

	await interaction.showModal(
		new ModalBuilder()
			.setTitle(`Creating tag: ${tag_name}`)
			.setCustomId('tag--modal')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setStyle(TextInputStyle.Paragraph)
						.setCustomId('tag--modal__content')
						.setLabel('Content')
						.setMaxLength(2000)
						.setRequired(true)
						.setValue('Enter the content for the tag'),
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

	const { error } = await supabase.from('tags').insert({
		tag_name: tag_name,
		tag_content: content,
		author_id: interaction.user.id,
	});

	await submission.reply(
		error
			? {
					content: `There was an error in creating the tag "${tag_name}". Tag names are case insensitive and should be unique.`,
				}
			: {
					content: `Added tag "${tag_name}".`,
					embeds: tags_embed_builder({
						tag_name,
						tag_content: content,
						author: member,
					}),
				},
	);
};
