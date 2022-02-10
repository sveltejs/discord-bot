import { Message } from 'discord.js';
import { TAG_CREATE_PERMITTED_IDS } from '../../config.js';
import { supabase } from '../../db/index.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { has_any_role_or_id } from '../../utils/snowflake.js';
import { get_member, get_tag, Tag, TagCUDHandler } from './_common.js';

const validator_regex = /^[a-z0-9\-\+\_\.\ ]*$/;

export const tag_create_handler: TagCUDHandler = async ({
	interaction,
	tag_name,
}) => {
	const member = (await get_member(interaction, interaction.user.id))!;

	if (!has_any_role_or_id(member, TAG_CREATE_PERMITTED_IDS)) {
		return interaction.reply({
			content: "You don't have the permissions to create a tag.",
			ephemeral: true,
		});
	}

	if (await get_tag(tag_name)) {
		return interaction.reply({
			content:
				'A tag with that name exists already. Did you mean to do `/tags update` instead?',
			ephemeral: true,
		});
	}

	if (!validator_regex.test(tag_name)) {
		return interaction.reply({
			content: `The name provided isn't valid. It must match \`${validator_regex.source}\``,
			ephemeral: true,
		});
	}

	/** @todo replace this jank with the modal thingy */
	await interaction.reply({
		content:
			'Send the contents for the tag in this channel within the next 60 seconds.',
		ephemeral: true,
	});

	const message = await interaction.channel
		?.awaitMessages({
			time: 60000,
			filter: (message: Message) => message.author === interaction.user,
			max: 1,
		})
		.then((coll) => coll.first());

	if (!message) {
		return interaction.editReply({
			content: 'No content received for the tag. Aborting.',
		});
	}

	// All messages from the bot are ephemeral so feels kinda weird to have the message stick around
	await message.delete();

	const tag_update = await supabase.from<Tag>('tags').insert({
		tag_name: tag_name,
		tag_content: message.content,
		author_id: interaction.user.id,
	});

	if (tag_update.error) {
		return interaction.editReply({
			content: `There was an error in creating the tag "${tag_name}". Tag names are case insensitive and should be unique.`,
		});
	}

	await interaction.editReply({
		content: `Added tag "${tag_name}".`,
		embeds: [
			tags_embed_builder({
				tag_name,
				tag_content: message.content,
				author: member,
			}),
		],
	});
};
