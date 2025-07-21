import { type Message } from 'discord.js';
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

	const pluralLink = updated_link_list.length === 1 ? 'link' : 'links';

	// Reply inline
	try {
		await message.reply(
			`I converted your \`x.com\` ${pluralLink} to use \`xcancel.com\` so that server members won't require an account to view content and threads:\n${updated_link_list}`,
		);

		await message.suppressEmbeds(true);
	} catch {
		// don't handle failures
	}
}
