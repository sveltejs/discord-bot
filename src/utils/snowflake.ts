import { GuildMember, Snowflake } from 'discord.js';

/**
 * Check if a member has any of the given roles or ids.
 *
 * @param {GuildMember} member
 * @param {Snowflake[]} snowflakes - The list of snowflakes to compare the member's roles/id against
 */
export function has_any_role_or_id(
	member: GuildMember,
	snowflakes: Snowflake[],
): boolean {
	for (const snowflake of snowflakes) {
		if (snowflake === member.id || member.roles.cache.has(snowflake))
			return true;
	}

	return false;
}
