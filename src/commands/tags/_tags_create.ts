import { SupabaseClient } from '@supabase/supabase-js';
import { CommandInteraction, Message } from 'discord.js';
import { tagsEmbedBuilder } from '../../utils/embedBuilder';
import { Tag } from './tags_read';

export async function tagCreateCommandHandler({
	tag,
	interaction,
	tagName,
	supabase,
}: {
	tag: Tag | undefined;
	interaction: CommandInteraction;
	tagName: string;
	supabase: SupabaseClient;
}) {
	if (tag) {
		await interaction.reply({
			content:
				'A tag with that name exists already. Did you mean to do `/tags update` instead?',
			ephemeral: true,
		});
		throw new Error('EARLY_RETURN_EXCEPTION');
	}

	if (!/^[a-z0-9\-\+\_\.\ ]*$/.test(tagName)) {
		await interaction.reply({
			content:
				"The name provided isn't valid. It must match `/^[a-z0-9\\-\\+\\_\\.\\ ]*$/`",
			ephemeral: true,
		});
		throw new Error('EARLY_RETURN_EXCEPTION');
	}

	await interaction.reply({
		content:
			'Send the contents for the tag in this channel within the next 60 seconds.',
		ephemeral: true,
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
	// All messages from the bot are ephemeral so feels kinda weird to have the message stick around
	const { error } = await supabase.from<Tag>('tags').insert({
		tag_name: tagName,
		tag_content: message.content,
		author_id: interaction.user.id,
	});
	if (error) {
		await interaction.editReply({
			content: `There was an error in creating the tag "${tagName}". Tag names are case insensitive and should be unique.`,
		});
		throw new Error('EARLY_RETURN_EXCEPTION');
	}
	await interaction.editReply({
		content: `Added tag "${tagName}".`,
		embeds: [
			tagsEmbedBuilder({
				tagName,
				tagContent: message.content,
				author: interaction.user,
			}),
		],
	});
}
