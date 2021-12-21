import { SupabaseClient } from '@supabase/supabase-js';
import { CommandInteraction, GuildMember, Snowflake } from 'discord.js';
import { JellyCommands } from 'jellycommands';
import { TAG_DEL_PERMITTED_ROLES } from '../../config';
import { tagsEmbedBuilder } from '../../utils/embedBuilder';
import { EARLY_RETURN_EXCEPTION, Tag } from './_common';

export async function tagDeleteCommandHandler({
	tag,
	interaction,
	supabase,
	tagName,
	client,
}: {
	tag: Tag | undefined;
	interaction: CommandInteraction;
	supabase: SupabaseClient;
	tagName: string;
	client: JellyCommands;
}) {
	if (!tag) {
		await interaction.reply({
			content: 'No tag with that name exists.',
			ephemeral: true,
		});
		throw EARLY_RETURN_EXCEPTION;
	}
	if (
		interaction.user.id !== tag.author_id &&
		!hasAnyRole(interaction.member as GuildMember, TAG_DEL_PERMITTED_ROLES)
	) {
		await interaction.reply({
			content:
				"You don't have the permissions to delete that tag. You either have to be the author or a moderator.",
			ephemeral: true,
		});
		throw EARLY_RETURN_EXCEPTION;
	}

	const { error } = await supabase
		.from<Tag>('tags')
		.delete()
		.eq('id', tag.id);
	if (error) {
		await interaction.reply({
			content: `Failed to delete tag "${tagName}".`,
			ephemeral: true,
		});
		throw EARLY_RETURN_EXCEPTION;
	}
	await interaction.reply({
		content: `Tag "${tagName}" was successfully deleted.`,
		embeds: [
			tagsEmbedBuilder({
				tagName,
				tagContent: tag.tag_content,
				author: client.users.cache.get(tag.author_id),
			}),
		],
		ephemeral: true,
	});
}

function hasAnyRole(member: GuildMember, roles: Snowflake[]): boolean {
	return member.roles.cache.hasAny(...roles);
}
