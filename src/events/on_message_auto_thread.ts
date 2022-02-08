import { Message, MessageOptions, ThreadChannel } from 'discord.js';
import { AUTO_THREAD_CHANNELS, HELP_CHANNELS } from '../config.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import { get_title_from_url } from '../utils/unfurl.js';
import { add_thread_prefix } from '../utils/threads.js';
import { build_embed } from '../utils/embed_helpers.js';
import { LINK_ONLY_CHANNELS } from '../config.js';
import { event } from 'jellycommands';
import urlRegex from 'url-regex';

export default event({
	name: 'messageCreate',
	run: async ({}, message) => {
		if (message.author.bot) return;

		if (
			AUTO_THREAD_CHANNELS.includes(message.channel.id) &&
			!message.hasThread &&
			message.channel.type == 'GUILD_TEXT'
		) {
			try {
				const raw_name = await get_thread_name(message);
				const prefixed = add_thread_prefix(raw_name, false);

				const name = HELP_CHANNELS.includes(message.channelId)
					? prefixed
					: raw_name;

				const thread = await message.channel.threads.create({
					name: name.slice(0, 100),
					startMessage: message,
				});

				thread.send(instruction_message(thread)).catch(() => {});
			} catch {
				// we can ignore this error since chances are it will be that thread already exists
			}
		}
	},
});

function get_thread_name(message: Message): string | Promise<string> {
	const url = message.content.match(urlRegex());

	// If the channel isn't a link channel (i.e. a question one) or url can't be matched
	if (!LINK_ONLY_CHANNELS.includes(message.channelId) || !url)
		return `${message.content.replace(urlRegex(), '')}`;

	return get_title_from_url(url[0]);
}

function instruction_message(thread: ThreadChannel): MessageOptions {
	const base_description =
		"I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it.";

	if (!HELP_CHANNELS.includes(thread.parentId!))
		return {
			embeds: [
				build_embed({
					description: base_description,
				}),
			],
		};

	const archiveButton = new MessageButton({
		label: 'Archive',
		customId: 'thread-archive',
		emoji: '🔒',
		style: 'SECONDARY',
	});

	const solveButton = new MessageButton({
		label: 'Solved',
		customId: 'thread-solved',
		emoji: '✅',
		style: 'PRIMARY',
	});

	const row = new MessageActionRow({
		components: [solveButton, archiveButton],
	});

	return {
		components: [row],

		embeds: [
			build_embed({
				description: `${base_description}\n\nWhen your problem is solved you can archive it with \`/thread archive\`\n\nWhen your problem is solved run \`/thread solve\`, don't forget to credit the person that helped you!`,
			}),
		],
	};
}
