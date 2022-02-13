import {
	GuildMember,
	MessageActionRow,
	MessageButton,
	MessageOptions,
	Snowflake,
	ThreadChannel,
} from 'discord.js';
import { THREAD_ADMIN_IDS } from '../config.js';
import { supabase } from '../db/index.js';
import { build_embed } from './embed_helpers.js';
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

export async function solve_thread(thread: ThreadChannel) {
	return (
		thread
			.setName(add_thread_prefix(thread.name, true).slice(0, 100))
			// Archiving immediately won't let users click the buttons.
			// This should also help with people unarchiving the thread
			// for saying `you're welcome` and what not.
			.then((t) => t.setAutoArchiveDuration(60))
	);
}

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

	const start_message = await undefined_on_error(
		thread.fetchStarterMessage(),
	);

	if (start_message) allowed_ids.push(start_message.author.id);

	const thread_owner = await undefined_on_error(thread.fetchOwner());
	if (thread_owner) allowed_ids.push(thread_owner.id);

	return has_any_role_or_id(member!, allowed_ids);
}

export async function get_ending_message(
	thread: ThreadChannel,
	initiator_id: Snowflake,
): Promise<MessageOptions> {
	const start_message = await undefined_on_error(
		thread.fetchStarterMessage(),
	);
	const clickable_participants = thread.guildMembers.filter(
		(m) =>
			!m.user.bot && m.id !== (start_message?.author.id ?? initiator_id),
	);

	const embed = build_embed({
		description: `Thread marked as solved. ${
			clickable_participants.size
				? 'Click the people who helped you solve it.'
				: ''
		}`,
	});

	const row = new MessageActionRow().setComponents(
		clickable_participants.map((m) =>
			new MessageButton()
				.setCustomId(`thread_solver_${m.id}`)
				.setLabel(m.displayName)
				.setStyle('PRIMARY')
				.setDisabled(false),
		),
	);

	return clickable_participants.size
		? {
				components: [row],
				embeds: [embed],
		  }
		: {
				embeds: [embed],
		  };
}
