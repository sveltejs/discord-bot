import { SupabaseClient } from '@supabase/supabase-js';
import { CommandInteraction, Message } from 'discord.js';
import { JellyCommands } from 'jellycommands';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { Tag } from './_common.js';

export async function tag_update_command_handler({
	tag,
	interaction,
	tag_name,
	client,
	supabase,
}: {
	tag: Tag | undefined;
	interaction: CommandInteraction;
	tag_name: string;
	client: JellyCommands;
	supabase: SupabaseClient;
}) {
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

	await interaction.reply({
		content: `Editing tag "${tag_name}". Send the new contents for the tag in this channel within the next 60 seconds.`,
		ephemeral: true,
		embeds: [
			tags_embed_builder({
				tag_name,
				tag_content: tag.tag_content,
				author: client.users.cache.get(tag.author_id),
			}),
		],
	});

	let messageColl = await interaction.channel?.awaitMessages({
		time: 60000,
		filter: (message: Message) => message.author === interaction.user,
		max: 1,
	});

	const message = messageColl?.first();
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
				author: client.users.cache.get(tag.author_id),
			}),
		],
	});
}
