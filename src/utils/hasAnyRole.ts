import { GuildMember, Snowflake } from 'discord.js';

/**
 * Check if a member has any of the given roles.
 *
 * @param {GuildMember} member
 * @param {Snowflake[]} roles - The list of roles to compare the member's roles against
 *
 * @todo Might not work as expected when either
 * - APIInteractionGuildMember is received instead of GuildMember, idk when that happens
 * - A cache miss
 */
export function hasAnyRole(member: GuildMember, roles: Snowflake[]): boolean {
	return member.roles.cache.hasAny(...roles);
}
