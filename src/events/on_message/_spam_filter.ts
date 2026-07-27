import { userMention, type Message } from 'discord.js';
import { mod_forward, mod_log } from '../../utils/mod_logs.ts';
import { has_any_role_or_id } from '../../utils/snowflake.ts';
import { RateLimitStore } from '../../utils/ratelimit.ts';
import { ban, kick, timeout } from '../../utils/member_actions.ts';
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

const SpamAction = Object.freeze({
	LOG: 'log',
	TIMEOUT: 'timeout',
	KICK: 'kick',
	BAN: 'ban',
});
type SpamActionValues = (typeof SpamAction)[keyof typeof SpamAction]

type SpamOptions = {
	/**
	 * Reason for kick/ban/timeout
	 * e.g. `User was kicked for ${log_reason}`
	 */
	log_reason: string;
};

type SpamFilter = {
	name: string;
	condition: (message: Message) => boolean;
	/** All actions log by default. */
	action: SpamActionValues;
	options?: SpamOptions;
};
const spam_filters: SpamFilter[] = [
	{
		name: 'Posts many links within a channel',
		condition: (message) => {
			return (
				message.inGuild() &&
				!message.thread &&
				has_link(message) &&
				single_channel_limit.is_limited(
					message.author.id,
					message.channelId,
				)
			);
		},
		action: 'ban',
	},
	{
		name: 'Posts many messages across channels',
		condition: (message) => {
			return (
				message.inGuild() &&
				!message.thread &&
				multi_channel_limit.is_limited(
					message.author.id,
					message.channelId,
				)
			);
		},
    get action(): SpamActionValues {
      return SPAM_FILTER_MULTI_CHANNEL_ACTION ?? 'log'
    },
	},
	{
		name: 'Posts in honeypot',
		condition: (message) => {
			return (
				message.inGuild() &&
				message.channelId === HONEYPOT_CHANNEL &&
				// Message by non-admin
				!has_any_role_or_id(message.member, MODERATOR_IDS)
			);
		},
		action: 'kick',
		options: {
			log_reason: 'posting in honeypot',
		},
	},
];

export default async function spam_filter(message: Message) {
	const spam_detected = spam_filters.find((filter) => {
		return filter.condition(message);
  });

  if (!spam_detected) return
	console.log(`User ID: ${message.author.id} tripped spam filter`);

	const member = debug(await message.guild?.members.fetch(message.author.id));
	const is_threadlord = has_any_role_or_id(member, THREAD_ADMIN_IDS);

	if (DEV_MODE) {
		await message.reply('Oi, stop spamming you troglodyte.');
		// Unlikely to be spam from trusted members
	} else if (!debug(is_threadlord) && spam_detected && member) {
		// Forward last message
		await mod_forward(message);
		const log_reason = spam_detected.options?.log_reason;

		switch (spam_detected.action) {
			// TODO timeout case
			case SpamAction.BAN:
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
				break;
			case SpamAction.KICK:
				await Promise.allSettled([
					kick(member, log_reason),
					mod_log(
						message.client,
						`User ${userMention(message.author.id)} was kicked${log_reason ? ` for ${log_reason}` : ''}.`,
					),
				]);
        break;
      case SpamAction.TIMEOUT:
        await Promise.allSettled([
          timeout(member, { reason: log_reason }),
          mod_log(
						message.client,
						`User ${userMention(message.author.id)} was timed out${log_reason ? ` for ${log_reason}` : ''}.`,
					),
        ])
        break;
		}
	}

	throw STOP;
}
