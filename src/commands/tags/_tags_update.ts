import { SupabaseClient } from '@supabase/supabase-js';
import { CommandInteraction, Message } from 'discord.js';
import { JellyCommands } from 'jellycommands';
import { tagsEmbedBuilder } from '../../utils/embedBuilder';
import { Tag } from './tags_read';

export async function tagUpdateCommandHandler({
	tag,
	interaction,
	tagName,
	client,
	supabase,
}: {
	tag: Tag | undefined;
	interaction: CommandInteraction;
	tagName: string;
	client: JellyCommands;
	supabase: SupabaseClient;
}) {
	if (!tag) {
		await interaction.reply({
			content:
				'No tag with that name exists. Did you mean to do `/tags create` instead?',
			ephemeral: true,
		});
		throw new Error('EARLY_RETURN_EXCEPTION');
	}
	if (interaction.user.id !== tag.author_id) {
		await interaction.reply({
			content:
				"You don't have the permissions to edit that tag. You have to be the author of the tag.",
			ephemeral: true,
		});
		throw new Error('EARLY_RETURN_EXCEPTION');
	}

	await interaction.reply({
		content: `Editing tag "${tagName}". Send the new contents for the tag in this channel within the next 60 seconds.`,
		ephemeral: true,
		embeds: [
			tagsEmbedBuilder({
				tagName,
				tagContent: tag.tag_content,
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
		await interaction.editReply({
			content: 'No content received for the tag. Aborting.',
		});
		throw new Error('EARLY_RETURN_EXCEPTION');
	}
	await message.delete();

	const { error } = await supabase
		.from<Tag>('tags')
		.update({ tag_content: message.content })
		.eq('id', tag.id);

	if (error) {
		await interaction.editReply({
			content: `Failed to update tag "${tagName}."`,
		});
		throw new Error('EARLY_RETURN_EXCEPTION');
	}
	await interaction.editReply({
		content: `Tag "${tagName}" was successfully updated.`,
		embeds: [
			tagsEmbedBuilder({
				tagName,
				tagContent: message.content,
				author: client.users.cache.get(tag.author_id),
			}),
		],
	});
}
