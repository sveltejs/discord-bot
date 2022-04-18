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
import { no_op, undefined_on_error } from './promise.js';
import { has_any_role_or_id } from './snowflake.js';

export const add_thread_prefix = (name: string, solved: boolean) => {
	const prefix = `${solved ? '✅' : '❔'} - `;

	return `${prefix}${name.replace(/^[✅❔] - /, '')}`;
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
	return thread.edit({
		name: add_thread_prefix(thread.name, true).slice(0, 100),
		// Archiving immediately won't let users click the buttons.
		autoArchiveDuration: 60,
	});
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

	await Promise.all([
		thread.fetchStarterMessage().then((message) => {
			allowed_ids.push(message.author.id);
		}, no_op),

		thread.fetchOwner().then((owner) => {
			if (owner) allowed_ids.push(owner.id);
		}, no_op),
	]);

	return has_any_role_or_id(member, allowed_ids);
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
