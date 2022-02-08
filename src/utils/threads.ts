import { ThreadChannel } from 'discord.js';

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
