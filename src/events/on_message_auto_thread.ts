import { Message, ThreadChannel } from 'discord.js';
import { event } from 'jellycommands';
import url_regex from 'url-regex';
import {
	AUTO_THREAD_CHANNELS,
	HELP_CHANNELS,
	LINK_ONLY_CHANNELS,
} from '../config.js';
import { wrap_in_embed } from '../utils/embed_helpers.js';
import { add_thread_prefix } from '../utils/threads.js';
import { get_title_from_url } from '../utils/unfurl.js';

export default event({
	name: 'messageCreate',
	run: async ({}, message) => {
		const should_ignore =
			message.author.bot ||
			message.hasThread ||
			message.channel.type != 'GUILD_TEXT' ||
			(LINK_ONLY_CHANNELS.includes(message.channel.id) && // It's going to be deleted in this case, which could cause an orphan thread
				!url_regex().test(message.content));

		if (should_ignore) return;

		if (AUTO_THREAD_CHANNELS.includes(message.channel.id)) {
			try {
				const raw_name = await get_thread_name(message);
				const prefixed = add_thread_prefix(raw_name, false);

				const name = HELP_CHANNELS.includes(message.channelId)
					? prefixed
					: raw_name;

				await message.channel.threads
					.create({
						name: name.slice(0, 100),
						startMessage: message,
					})
					.then(send_instruction_message);
			} catch {
				// we can ignore this error since chances are it will be that thread already exists
			}
		}
	},
});

function get_thread_name(message: Message): string | Promise<string> {
	const url = message.content.match(url_regex());

	// If the channel isn't a link channel (i.e. a question one) or url can't be matched
	if (!LINK_ONLY_CHANNELS.includes(message.channelId) || !url)
		return `${message.content.replace(url_regex(), '')}`;

	return get_title_from_url(url[0]);
}

function send_instruction_message(thread: ThreadChannel) {
	const base_description =
		"I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it.";

	const description = HELP_CHANNELS.includes(thread.parentId!)
		? `${base_description}\n\nWhen your problem is solved close the thread with the \`/thread solve\` command.`
		: base_description;

	return thread.send(wrap_in_embed(description));
}
