import type { GuildMember, ThreadChannel, User } from 'discord.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { has_any_role_or_id } from './snowflake.js';
import type { JellyCommands } from 'jellycommands';
import { undefined_on_error } from './promise.js';
import { THREAD_ADMIN_IDS } from '../config.js';

export const add_thread_prefix = (name: string, solved: boolean) => {
	const prefix = `${solved ? '✅' : '❔'} - `;

	if (name.startsWith('✅ - ') || name.startsWith('❔ - '))
		return `${prefix}${name.slice(4)}`;

	return `${prefix}${name}`;
};

export async function rename_thread(
	thread: ThreadChannel,
	new_name: string,
	use_prefix: boolean = true,
) {
	const prefixed = add_thread_prefix(new_name, thread.name.startsWith('✅'));
	await thread.setName((use_prefix ? prefixed : new_name).slice(0, 100));
}

interface ThreadSolvesTable {
	user_id: string;
	count: number;
}

export async function solve_thread(
	thread: ThreadChannel,
	client: JellyCommands,
	solver: GuildMember | User,
) {
	const supabase = client.props.get<SupabaseClient>('supabase');

	const { data } = await supabase
		.from<ThreadSolvesTable>('thread_solves')
		.select('count')
		.eq('user_id', solver.id)
		.limit(1);

	if (!data) throw new Error('Error in getting solves from database');

	const count = data[0]?.count || 0;

	const { error } = await supabase.from('thread_solves').upsert({
		user_id: solver.id,
		count: count + 1,
	});

	if (error) throw new Error(error.message);

	await thread.setName(add_thread_prefix(thread.name, true));

	if (!thread.archived) {
		thread.setArchived(true).catch(() => {});
	}
}

export async function check_autothread_permissions(
	thread: ThreadChannel,
	member: GuildMember,
): Promise<boolean> {
	const allowed_ids = [...THREAD_ADMIN_IDS];

	const start_message = await undefined_on_error(
		thread.fetchStarterMessage(),
	);

	if (start_message) allowed_ids.push(start_message.author.id);

	const thread_owner = await undefined_on_error(thread.fetchOwner());
	if (thread_owner) allowed_ids.push(thread_owner.id);

	return has_any_role_or_id(member!, allowed_ids);
}
