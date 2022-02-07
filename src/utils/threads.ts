import { TextBasedChannel } from 'discord.js';

export async function rename_thread(
	thread: TextBasedChannel,
	new_name: string,
	{
		prefix,
		prefixes_to_keep,
	}: {
		prefix?: string;
		prefixes_to_keep?: string[];
	} = {},
) {
	if (!thread.isThread()) throw new Error('This is not a thread channel');

	const existing_prefix = prefixes_to_keep?.find((p) =>
		thread.name.startsWith(p),
	);

	const _new_name = `${prefix || existing_prefix || ''}${new_name}`.slice(
		0,
		100,
	);

	try {
		/** Something's going wrong here, might be rate limit idk */
		await thread.setName(_new_name);
	} catch {
		throw new Error('API Error: Failed to rename thread');
	}
}
