import { has_any_role_or_id } from '../../utils/snowflake';
import { DEV_MODE, THREAD_ADMIN_IDS } from '../../config';
import { RateLimitStore } from '../../utils/ratelimit';
import { userMention, type GuildMember, type Message } from 'discord.js';
import { setTimeout } from 'node:timers/promises';
import { has_link, STOP } from './_common';
import { mod_forward, mod_log } from '../../utils/mod_logs';

// 3 messages within a 5 second period
const singleChannelLimit = new RateLimitStore(3, 5_000, 1);

// 3 messages across 3 channels within a 10 second period
const multiChannelLimit = new RateLimitStore(3, 10_000, 3);

function debug<T>(val: T): T {
	console.log(val);
	return val;
}

export default async function spam_filter(message: Message) {
	const posts_many_links_within_a_channel =
		message.inGuild() &&
		!message.thread &&
		has_link(message) &&
		singleChannelLimit.is_limited(
			message.author.id,
			message.channelId,
			true,
		);

	const posts_many_messages_across_channels =
		message.inGuild() &&
		!message.thread &&
		multiChannelLimit.is_limited(
			message.author.id,
			message.channelId,
			true,
		);

	const is_likely_spam =
		posts_many_links_within_a_channel ||
		posts_many_messages_across_channels;

	if (!is_likely_spam) return;

	console.log(`User ID: ${message.author.id} tripped spam filter`);

	const member = debug(await message.guild.members.fetch(message.author.id));
	const is_threadlord = has_any_role_or_id(member, THREAD_ADMIN_IDS);

	if (DEV_MODE) {
		await message.reply('Oi, stop spamming you troglodyte.');
		// Unlikely to be spam from trusted members
	} else if (!debug(is_threadlord)) {
		// Ban hammer
		await mod_forward(message);

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
	}

	throw STOP;
}

async function ban(member: GuildMember, tries: number) {
	console.log(tries, member.bannable); // TODO Remove these when I figure out why it's not working
	// biome-ignore lint/style/noParameterAssign: todo
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
