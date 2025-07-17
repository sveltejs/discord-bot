import type { GuildMember, Interaction, Snowflake } from 'discord.js';

/**
 * Check if a member has any of the given roles or ids.
 *
 * @param {GuildMember} member
 * @param {Snowflake[]} snowflakes - The list of snowflakes to compare the member's roles/id against
 */
export function has_any_role_or_id(
	member: GuildMember | null | undefined,
	snowflakes: Snowflake[],
) {
	return snowflakes.some(
		(snowflake) =>
			snowflake === member?.id || member?.roles.cache.has(snowflake),
	);
}

/**
 * Get the member having the `id` in the guild where the interaction was created.
 * @default {id} interaction.user.id
 */
export async function get_member(
	interaction: Pick<Interaction, 'guild' | 'user'>,
	id: Snowflake = interaction.user.id,
) {
	return interaction.guild?.members.fetch(id).catch(() => null);
}
