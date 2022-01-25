import { SupabaseClient } from '@supabase/supabase-js';
import { CommandInteraction, GuildMember } from 'discord.js';
import { JellyCommands } from 'jellycommands';
import { TAG_DEL_PERMITTED_ROLES } from '../../config.js';
import { tags_embed_builder } from '../../utils/embedBuilder.js';
import { has_any_role_or_id } from '../../utils/hasAnyRole.js';
import { Tag } from './_common.js';

export async function tag_delete_command_handler({
	tag,
	interaction,
	supabase,
	tag_name,
	client,
}: {
	tag: Tag | undefined;
	interaction: CommandInteraction;
	supabase: SupabaseClient;
	tag_name: string;
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
		!has_any_role_or_id(member, [tag.author_id, ...TAG_DEL_PERMITTED_ROLES])
	) {
		return await interaction.reply({
			content:
				"You don't have the permissions to delete that tag. You either have to be the author or a moderator.",
			ephemeral: true,
		});
	}

	if ((await supabase.from<Tag>('tags').delete().eq('id', tag.id)).error) {
		return await interaction.reply({
			content: `Failed to delete tag "${tag_name}".`,
			ephemeral: true,
		});
	}

	await interaction.reply({
		content: `Tag "${tag_name}" was successfully deleted.`,
		embeds: [
			tags_embed_builder({
				tag_name,
				tag_content: tag.tag_content,
				author: client.users.cache.get(tag.author_id),
			}),
		],
		ephemeral: true,
	});
}
