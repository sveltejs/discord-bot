import type { GuildMember } from 'discord.js';
import { setTimeout } from 'node:timers/promises';

/** 24 hours in seconds. */
const TWENTY_FOUR_HOURS = 86_400;

/** 12 hours in ms */
const TWELVE_HOURS_MS = 43_200_000;

/** Two hours in seconds */
const TWO_HOURS = 7_200;

type TimeoutOptions = {
	timeout_length?: number;
	reason?: string;
	retries?: number;
};

/**
 * Time out member.
 * @param member
 * @param options
 * @property options.timeout_length Timeout period in ms
 * @property options.reason Timeout reason
 * @property options.retries Timeout action retries
 */
export async function timeout(member: GuildMember, options?: TimeoutOptions) {
	const { reason, retries, timeout_length } = Object.assign(
		{},
		{
			timeout_length: TWELVE_HOURS_MS,
			reason: 'Bot action',
			retries: 3,
		},
		options,
	);

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

/**
 * Kick server member
 * @param member
 * @param reason Kick reason
 * @param retries Kick action retries
 * @param removeLastMessages Remove last messages, represented
 * as past time in seconds
 */
export async function kick(
	member: GuildMember,
	reason = 'Bot action',
	/** @default 3 */
	retries = 3,
	removeLastMessages = TWO_HOURS,
) {
	let retries_remaining = retries;

	while (--retries_remaining && member.timeout) {
		try {
			// Ban then unban to easily remove messages
			await member.ban({
				reason,
				deleteMessageSeconds: removeLastMessages,
			});

			// Artificial delay to ensure supposed message deletion
			// background task completes before unbanning
			await setTimeout(3_000);

			await member.guild.members.unban(
				member,
				'Unbanning member with the intent to kick and delete messages.',
			);
			console.log(
				`Kicked ${member.displayName} (ID: ${member.id}) due to ${reason}.`,
			);
			break;
		} catch {
			await setTimeout(1_000);
		}
	}
}

/**
 * Ban member.
 * @param member
 * @param retries
 */
export async function ban(member: GuildMember, retries: number) {
	console.log(retries, member.bannable); // TODO Remove these when I figure out why it's not working

	// biome-ignore lint/style/noParameterAssign: todo
	while (--retries && member.bannable) {
		try {
			await member.ban({
				reason: 'Spam',
				deleteMessageSeconds: TWENTY_FOUR_HOURS,
			});
			console.log(
				`Banned ${member.displayName} (ID: ${member.id}) for spamming`,
			);
			break;
		} catch {
			await setTimeout(1000);
		}
	}
}
