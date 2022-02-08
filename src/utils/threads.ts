import type { GuildMember, ThreadChannel, User } from 'discord.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { JellyCommands } from 'jellycommands';

export async function rename_thread(
	thread: ThreadChannel,
	new_name: string,
	use_prefix: boolean = true,
) {
	const solved = thread.name.startsWith('✅ - ');
	const prefix = `${solved ? '✅' : '❔'} - `;

	await thread.setName(
		`${use_prefix ? prefix : ''}${new_name}`.slice(0, 100),
	);
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

	await thread.setName(`✅${thread.name.slice(1)}`);

	if (!thread.archived) {
		thread.setArchived(true).catch(() => {});
	}
}
