import { GuildMember, Snowflake, ThreadChannel } from 'discord.js';
import { THREAD_ADMIN_IDS } from '../config.js';
import { supabase } from '../db/index.js';
import { no_op } from './promise.js';
import { has_any_role_or_id } from './snowflake.js';

export async function increment_solve_count(id: Snowflake) {
	const { error } = await supabase.rpc('increment_solve_count', {
		solver_id: id,
	});

	if (error) throw new Error(error.message);
}

export async function check_autothread_permissions(
	thread: ThreadChannel,
	member: GuildMember,
): Promise<boolean> {
	const allowed_ids = [...THREAD_ADMIN_IDS];
	if (thread.ownerId) allowed_ids.push(thread.ownerId);

	await thread.fetchStarterMessage().then((message) => {
		if (message) allowed_ids.push(message.author.id);
	}, no_op);

	return has_any_role_or_id(member, allowed_ids);
}
