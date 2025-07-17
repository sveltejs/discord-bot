import { has_any_role_or_id } from '../../utils/snowflake';
import { DEV_MODE, THREAD_ADMIN_IDS } from '../../config';
import { RateLimitStore } from '../../utils/ratelimit';
import type { GuildMember, Message } from 'discord.js';
import { setTimeout } from 'node:timers/promises';
import { has_link, STOP } from './_common';

// 3 messages within a 10 second period
const limit = new RateLimitStore(3, 10_000);

function debug<T>(val: T): T {
	console.log(val);
	return val;
}

export default async function spam_filter(message: Message) {
	const is_likely_spam =
		message.inGuild() &&
		!message.thread &&
		has_link(message) &&
		limit.is_limited(message.author.id, true);

	if (!is_likely_spam) return;

	console.log(`User ID: ${message.author.id} tripped spam filter`);

	const member = debug(await message.guild.members.fetch(message.author.id));
	const is_threadlord = has_any_role_or_id(member, THREAD_ADMIN_IDS);

	if (DEV_MODE) {
		await message.reply('Oi, stop spamming you troglodyte.');
		// Unlikely to be spam from trusted members
	} else if (!debug(is_threadlord)) {
		await Promise.allSettled([
			ban(member, 3),
			member.send(
				'You were banned from the Svelte discord server for spamming. If you believe this was a mistake you can appeal the ban at <https://github.com/pngwn/svelte-bot/issues/38>',
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
