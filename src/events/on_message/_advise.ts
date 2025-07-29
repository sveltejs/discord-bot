import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessagePayload,
	userMention,
	type Message,
} from 'discord.js';
import urlRegex from 'url-regex';

export default async function mutate_content(message: Message) {
	if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

	const links = message.content
		.match(urlRegex())
		?.filter((link) => link.startsWith('https://x.com'))
		.map((link) =>
			link.replace(/^https:\/\/x\.com/, 'https://xcancel.com'),
		);

	if (!links || links.length === 0) {
		return;
	}

	const updated_link_list = links.map((link) => `- ${link}`).join('\n');

	const link_term = updated_link_list.length === 1 ? 'link' : 'links';

	const content = `${userMention(message.author.id)} I converted your \`x.com\` ${link_term} to use \`xcancel.com\` so that server members won't require an account to view content and threads:\n${updated_link_list}`;

	const hide_button = new ButtonBuilder()
		.setLabel('Hide embed')
		.setCustomId(`embed_hide_${message.author.id}`)
		.setStyle(ButtonStyle.Secondary);

	const keep_button = new ButtonBuilder()
		.setLabel('Keep embed')
		.setCustomId(`embed_keep_${message.author.id}`)
		.setStyle(ButtonStyle.Primary);

	const row = new ActionRowBuilder<ButtonBuilder>({
		components: [hide_button, keep_button],
	});

	const payload = new MessagePayload(message.channel, {
		content,
		components: [row],
	});

	// Send message with interactions
	try {
		await message.channel.send(payload);
		await message.suppressEmbeds(true);
	} catch {
		// don't handle failures
	}
}
