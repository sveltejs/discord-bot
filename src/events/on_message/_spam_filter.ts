import { userMention, type Message } from 'discord.js';
import { mod_forward, mod_log } from '../../utils/mod_logs.ts';
import { has_any_role_or_id } from '../../utils/snowflake.ts';
import { RateLimitStore } from '../../utils/ratelimit.ts';
import { timeout, ban, kick } from '../../utils/member_actions.ts';
import { has_link, STOP } from './_common.ts';
import {
	SPAM_FILTER_MULTI_CHANNEL_ACTION,
	THREAD_ADMIN_IDS,
	DEV_MODE,
	HONEYPOT_CHANNEL,
	MODERATOR_IDS,
} from '../../config.ts';

// 3 messages within a 5 second period
const single_channel_limit = new RateLimitStore(3, 5_000, 1);

// 3 messages across 3 channels within a 10 second period
const multi_channel_limit = new RateLimitStore(3, 10_000, 3);

function debug<T>(val: T): T {
	console.log(val);
	return val;
}

export default async function spam_filter(message: Message) {
	const posts_many_links_within_a_channel =
		message.inGuild() &&
		!message.thread &&
		has_link(message) &&
		single_channel_limit.is_limited(
			message.author.id,
			message.channelId,
			true,
		);

	const posts_many_messages_across_channels =
		message.inGuild() &&
		!message.thread &&
		multi_channel_limit.is_limited(
			message.author.id,
			message.channelId,
			true,
		);

	const posts_in_honeypot =
		message.inGuild() &&
		message.channelId === HONEYPOT_CHANNEL &&
		// Message by non-admin
		!has_any_role_or_id(message.member, MODERATOR_IDS);

	const is_likely_spam =
		posts_many_links_within_a_channel ||
		posts_many_messages_across_channels ||
		posts_in_honeypot;

	if (!is_likely_spam) return;

	console.log(`User ID: ${message.author.id} tripped spam filter`);

	const member = debug(await message.guild.members.fetch(message.author.id));
	const is_threadlord = has_any_role_or_id(member, THREAD_ADMIN_IDS);

	if (DEV_MODE) {
		await message.reply('Oi, stop spamming you troglodyte.');
		// Unlikely to be spam from trusted members
	} else if (!debug(is_threadlord)) {
		await mod_forward(message);

		if (
			posts_many_links_within_a_channel ||
			(posts_many_messages_across_channels &&
				SPAM_FILTER_MULTI_CHANNEL_ACTION === 'ban')
		) {
			// Ban
			await Promise.allSettled([
				ban(member, 3),
				member.send(
					'You were banned from the Svelte discord server for spamming. If you believe this was a mistake you can appeal the ban at <https://github.com/pngwn/svelte-bot/issues/38>',
				),
				mod_log(
					message.client,
					`User ${userMention(message.author.id)} was suspected of spamming and was banned.`,
				),
			]);
		} else if (posts_in_honeypot) {
			// Kick
			await Promise.allSettled([
				kick(member, 'Posting in honeypot'),
				mod_log(
					message.client,
					`User ${userMention(message.author.id)} was kicked for posting in honeypot.`,
				),
			]);
		} else {
			// Timeout
			await Promise.allSettled([
				timeout(member, 43_200_000, 'Multi-channel spam'),
				mod_log(
					message.client,
					`User ${userMention(message.author.id)} was suspected of spamming and was timed out.`,
				),
			]);
		}
	}

	throw STOP;
}
