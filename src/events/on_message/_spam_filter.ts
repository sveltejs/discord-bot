import { GuildMember, Message } from 'discord.js';
import { setTimeout } from 'timers/promises';
import { DEV_MODE, THREAD_ADMIN_IDS } from '../../config';
import { RateLimitStore } from '../../utils/ratelimit';
import { has_any_role_or_id } from '../../utils/snowflake';
import { has_link, STOP } from './_common';

// 3 messages within a 10 second period
const limit = new RateLimitStore(3, 10_000);

export default async function spam_filter(message: Message) {
	const is_likely_spam =
		has_link(message) &&
		!message.thread &&
		limit.is_limited(message.author.id, true);

	if (!is_likely_spam || !message.member) return;

	if (DEV_MODE) {
		await message.reply('Oi, stop spamming you troglodyte.');
	} else {
		const is_threadlord = has_any_role_or_id(
			message.member,
			THREAD_ADMIN_IDS,
		);

		// Unlikely to be spam from trusted members
		if (!is_threadlord) {
			await Promise.allSettled([
				ban(message.member, 3),
				message.member.send(
					'You were banned from the Svelte discord server for spamming. If you believe this was a mistake you can appeal the ban at https://github.com/pngwn/svelte-bot/issues/38',
				),
			]);
		}
	}

	throw STOP;
}

async function ban(member: GuildMember, tries = 0) {
	while (--tries && member.bannable) {
		try {
			await member.ban({
				reason: 'Spam',
				deleteMessageSeconds: 24 * 60 * 60,
			});
			console.log(
				`Banned ${member.displayName} (ID: ${member.id}) for spamming`,
			);
			break;
		} catch {
			await setTimeout(1_000);
		}
	}
}
