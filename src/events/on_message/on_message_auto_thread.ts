import { Message, MessageOptions, ThreadChannel } from 'discord.js';
import { event } from 'jellycommands';
import url_regex from 'url-regex';
import { AUTO_THREAD_CHANNELS, HELP_CHANNELS } from '../../config.js';
import { wrap_in_embed } from '../../utils/embed_helpers.js';
import { add_thread_prefix } from '../../utils/threads.js';
import { get_title_from_url } from '../../utils/unfurl.js';
import { fails_link_test, in_link_only_channel } from './_link_predicate.js';

export default event({
	name: 'messageCreate',
	run: async ({}, message) => {
		const should_ignore =
			message.author.bot ||
			message.channel.type != 'GUILD_TEXT' ||
			!AUTO_THREAD_CHANNELS.includes(message.channelId) ||
			fails_link_test(message); // If it fails link test then it'll get deleted and the thread will be orphaned

		if (should_ignore) return;

		if (message.type !== 'DEFAULT') {
			const ref_thread = (await message.fetchReference())?.thread;

			if (ref_thread)
				await Promise.allSettled([
					message.delete(),
					message.author.send(
						wrap_in_embed(
							`Your message in ${message.channel} was removed. Please use the thread ${ref_thread} to reply instead. The contents have been preserved below.`,
						),
					),
					message.author.send(message.content),
				]);
			return;
		}

		const raw_name = await get_thread_name(message);

		const name = HELP_CHANNELS.includes(message.channelId)
			? add_thread_prefix(raw_name, false)
			: raw_name;

		await message
			.startThread({ name: name.slice(0, 100) })
			.then(send_instruction_message);
	},
});

function get_thread_name(message: Message): string | Promise<string> {
	const url = message.content.match(url_regex());

	// If the channel isn't a link channel (i.e. a question one) or url can't be matched
	if (!in_link_only_channel(message) || !url)
		return `${message.content.replace(url_regex(), '')}`;

	return get_title_from_url(url[0]);
}

function send_instruction_message(thread: ThreadChannel) {
	const base_description =
		"I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it.";

	const description = HELP_CHANNELS.includes(thread.parentId!)
		? `${base_description}\n\nWhen your problem is solved close the thread with the \`/thread solve\` command.`
		: base_description;

	return thread.send(wrap_in_embed(description) as MessageOptions);
}
