import { SupabaseClient } from '@supabase/supabase-js';
import { CommandInteraction, GuildMember } from 'discord.js';
import { JellyCommands } from 'jellycommands';
import { TAG_DEL_PERMITTED_ROLES } from '../../config.js';
import { tagsEmbedBuilder } from '../../utils/embedBuilder.js';
import { hasAnyRole } from '../../utils/hasAnyRole.js';
import { Tag } from './_common.js';

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
		return await interaction.reply({
			content: 'No tag with that name exists.',
			ephemeral: true,
		});
	}

	const member = await interaction.guild?.members.fetch(interaction.user.id)!;
	if (
		!(
			interaction.user.id === tag.author_id ||
			hasAnyRole(member, TAG_DEL_PERMITTED_ROLES)
		)
	) {
		return await interaction.reply({
			content:
				"You don't have the permissions to delete that tag. You either have to be the author or a moderator.",
			ephemeral: true,
		});
	}

	if ((await supabase.from<Tag>('tags').delete().eq('id', tag.id)).error) {
		return await interaction.reply({
			content: `Failed to delete tag "${tagName}".`,
			ephemeral: true,
		});
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
