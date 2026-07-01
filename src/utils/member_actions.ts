import type { GuildMember } from 'discord.js';
import { setTimeout } from 'node:timers/promises';
// TODO: ban, warn

/**
 *
 * @param member
 * @param timeout_length Timeout period in ms
 * @param reason Timeout reason
 * @param retries Timeout action retries
 */
export async function timeout(
	member: GuildMember,
	timeout_length = 43_200_000, // 12 hours
	reason = 'Bot action',
	/** @default 3 */
	retries = 3,
) {
	let retries_remaining = retries;

	while (--retries_remaining && member.timeout) {
		try {
			await member.timeout(timeout_length, reason);
			console.log(
				`Timed out ${member.displayName} (ID: ${member.id}) due to ${reason}.`,
			);
			break;
		} catch {
			await setTimeout(1_000);
		}
	}
}
