import { ChannelType, ThreadChannel } from 'discord.js';

export function i_solemnly_swear_it_is_not_null<T>(
	t: T,
): asserts t is NonNullable<T> {}

export function i_solemnly_swear_it_is_a_forum_thread(
	t: ThreadChannel,
): asserts t is ThreadChannel<true> {
	if (t.parent?.type !== ChannelType.GuildForum)
		throw new Error('Not a forum thread');
}
