import { MessageActionRow, ModalActionRowComponent } from 'discord.js';
import { TAG_CREATE_PERMITTED_IDS } from '../../config.js';
import { supabase } from '../../db/index.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { get_member, has_any_role_or_id } from '../../utils/snowflake.js';
import { get_tag, Tag, TagCRUDHandler } from './_common.js';

const validator_regex = /^[a-z0-9\-\+\_\.\ ]*$/;

export const tag_create_handler: TagCRUDHandler = async ({
	interaction,
	tag_name,
}) => {
	const member = (await get_member(interaction))!;

	const fault = await (async () => {
		return !has_any_role_or_id(member, TAG_CREATE_PERMITTED_IDS)
			? "You don't have the permissions to create a tag."
			: !validator_regex.test(tag_name)
			? `The name provided isn't valid. It must match \`${validator_regex.source}\``
			: (await get_tag(tag_name))
			? 'A tag with that name exists already. Did you mean to do `/tags update` instead?'
			: null;
	})();

	if (fault !== null)
		return await interaction.reply({
			content: fault,
			ephemeral: true,
		});

	await interaction.showModal({
		title: `Creating tag: ${tag_name}`,
		customId: 'tag--modal',
		components: [
			new MessageActionRow<ModalActionRowComponent>().setComponents({
				type: 'TEXT_INPUT',
				customId: 'tag--modal__content',
				label: 'Content',
				maxLength: 2000,
				required: true,
				style: 'PARAGRAPH',
				value: 'Enter the content for the tag',
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

	const { error } = await supabase.from<Tag>('tags').insert({
		tag_name: tag_name,
		tag_content: content,
		author_id: interaction.user.id,
	});

	if (error)
		return await submission.reply({
			content: `There was an error in creating the tag "${tag_name}". Tag names are case insensitive and should be unique.`,
		});

	await submission.reply({
		content: `Added tag "${tag_name}".`,
		embeds: [
			tags_embed_builder({
				tag_name,
				tag_content: content,
				author: member,
			}),
		],
	});
};
