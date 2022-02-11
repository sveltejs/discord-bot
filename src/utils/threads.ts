import type { GuildMember, ThreadChannel, User } from 'discord.js';
import { THREAD_ADMIN_IDS } from '../config.js';
import { supabase } from '../db/index.js';
import { undefined_on_error } from './promise.js';
import { has_any_role_or_id } from './snowflake.js';

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

export async function solve_thread(
	thread: ThreadChannel,
	solver?: GuildMember | User,
) {
	if (solver) {
		const { error } = await supabase.rpc('increment_solve_count', {
			solver_id: solver.id,
		});

		if (error) throw new Error(error.message);
	}

	await thread.setName(add_thread_prefix(thread.name, true).slice(0, 100));
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
