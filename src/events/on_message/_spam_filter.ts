import { GuildMember, Message } from 'discord.js';
import { DEV_MODE, THREAD_ADMIN_IDS } from '../../config';
import { RateLimitStore } from '../../utils/ratelimit';
import { has_any_role_or_id } from '../../utils/snowflake';
import { has_link, STOP } from './_common';

// 3 messages within a 10 second period
const limit = new RateLimitStore(3, 10_000);

export default async function spam_filter(message: Message) {
	if (
		has_link(message) &&
		!message.thread &&
		limit.is_limited(message.author.id, true)
	) {
		if (DEV_MODE) {
			await message.reply('Oi, stop spamming you troglodyte.');
		} else if (
			message.member &&
			!has_any_role_or_id(message.member, THREAD_ADMIN_IDS) // Possibly banter, can be manually reviewed.
		) {
			await ban(message.member);
		}

		return STOP;
	}
	return;
}

async function ban(member: GuildMember, retried = 0) {
	if (retried >= 3 || !member.bannable) return;

	try {
		await member.ban({
			reason: 'Spam',
			// TODO: Update in v14
			// This has a bad name, it's how many days of messages from the user to delete
			// not for how many days to ban the user.
			days: 1,
		});
	} catch {
		await ban(member, retried + 1);
	}
}
