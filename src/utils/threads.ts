import { ThreadChannel } from 'discord.js';

const parse_prefix = (name: string): boolean => {
	if (!name.startsWith('❔ - ') || !name.startsWith('✅ - ')) return false;
	return name.startsWith('✅');
};

export async function rename_thread(
	thread: ThreadChannel,
	new_name: string,
	use_prefix: boolean = true,
) {
	const solved = parse_prefix(thread.name);
	const prefix = solved ? '✅' : '❔';

	await thread.setName(
		`${use_prefix ? prefix : ''}${new_name}`.slice(0, 100),
	);
}
