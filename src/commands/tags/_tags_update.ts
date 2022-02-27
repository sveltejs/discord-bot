import { Message } from 'discord.js';
import { supabase } from '../../db/index.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { get_member } from '../../utils/snowflake.js';
import { get_tag, Tag, TagCRUDHandler } from './_common.js';

export const tag_update_handler: TagCRUDHandler = async ({
	interaction,
	tag_name,
}) => {
	const tag = await get_tag(tag_name);

	if (!tag) {
		return interaction.reply({
			content:
				'No tag with that name exists. Did you mean to do `/tags create` instead?',
			ephemeral: true,
		});
	}

	if (interaction.user.id !== tag.author_id) {
		return interaction.reply({
			content:
				"You don't have the permissions to edit that tag. You have to be the author of the tag.",
			ephemeral: true,
		});
	}

	/** @todo replace this jank with the modal thingy */
	await interaction.reply({
		content: `Editing tag "${tag_name}". Send the new contents for the tag in this channel within the next 60 seconds.`,
		ephemeral: true,
		embeds: [
			tags_embed_builder({
				tag_name,
				tag_content: tag.tag_content,
				author: await get_member(interaction, tag.author_id),
			}),
		],
	});

	let message = await interaction.channel
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
	await message.delete();

	const tags_update = await supabase
		.from<Tag>('tags')
		.update({ tag_content: message.content })
		.eq('id', tag.id);

	if (tags_update.error) {
		return interaction.editReply({
			content: `Failed to update tag "${tag_name}."`,
		});
	}

	await interaction.editReply({
		content: `Tag "${tag_name}" was successfully updated.`,
		embeds: [
			tags_embed_builder({
				tag_name,
				tag_content: message.content,
				author: await get_member(interaction, tag.author_id),
			}),
		],
	});
};
