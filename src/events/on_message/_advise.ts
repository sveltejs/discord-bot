import urlRegex from 'url-regex';
import {
	type Message,
	ChannelType,
	hideLinkEmbed,
	codeBlock,
} from 'discord.js';

export default async function mutate_content(message: Message) {
	if (message.channel.type != ChannelType.GuildText) return;

	const links = message.content
		.match(urlRegex())
		?.filter((link) => link.startsWith('https://x.com'))
		.map((link) =>
			link.replace(/^https:\/\/x\.com/, 'https://xcancel.com'),
		);

	if (!links || links.length === 0) {
		return;
	}

	const updated_phrase: string =
		links.length > 1
			? 'Here are the updated links:'
			: 'Here is the updated link:';

	const updated_link_list = links
		.map((link) => `- ${hideLinkEmbed(link)}`)
		.join('\n');

	const updated_content = message.content.replace(urlRegex(), (match) => {
		return match.startsWith('https://x.com')
			? match.replace(/^https:\/\/x\.com/, 'https://xcancel.com')
			: match;
	});

	try {
		await message.author.send(
			`Re: ${message.url}\n\nI see you've provided a link to \`x.com\`. Please consider posting a new message having \`x.com\` replaced with \`xcancel.com\`, that way server members may view the message and thread without requiring an account.\n\n${updated_phrase}\n${updated_link_list}\n\nHere is your entire message with adjusted links:\n${codeBlock(updated_content)}`,
		);

		return; // mission complete
	} catch {
		// assume user disabled DMs upon error
	}

	// Plan B: inline reply
	try {
		await message.reply(
			`I converted your \`x.com\` links to use \`xcancel.com\` so that server members won't require an account to view content and threads:\n${updated_link_list}`,
		);
	} catch {
		// don't handle failures
	}
}
