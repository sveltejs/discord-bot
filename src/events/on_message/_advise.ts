import { ChannelType, Message } from 'discord.js';
import { has_link } from './_common.js';
import urlRegex from 'url-regex';

const replacementMap = [
	{ test: 'https://x.com', replace: 'https://xcancel.com' },
];

export default async function mutate_content(message: Message) {
	if (
		message.channel.type != ChannelType.GuildText ||
		(!has_link(message) && !message.content.includes('x.com'))
	)
		return;

	// Get links
	const caughtLinks: string[] | undefined = message.content
		.match(urlRegex())
		?.filter(
			(link) =>
				replacementMap.findIndex((item) =>
					link.startsWith(item.test),
				) !== -1,
		);
	if (!caughtLinks) return;

	const hasXLinks: boolean = caughtLinks.some((item) =>
		item.startsWith('https://x.com'),
	);
	if (!hasXLinks) return;

	const updatedPhrase: string =
		caughtLinks.length > 1
			? 'Here are the updated links:'
			: 'Here is the updated link:';

	const updatedLinks = caughtLinks.map((link) => {
		const replaceIdx = replacementMap.findIndex((item) =>
			link.startsWith(item.test),
		);
		return link.replace(
			replacementMap[replaceIdx].test,
			replacementMap[replaceIdx].replace,
		);
	});

	const updatedLinkList = updatedLinks.map((link) => `- ${link}\n`).join('');

	const updatedMessage: string = (function () {
		let newContent = message.content;
		replacementMap.forEach(
			(item) =>
				(newContent = newContent.replace(item.test, item.replace)),
		);
		return newContent;
	})();

	try {
		await message.author.send(
			`Re: ${message.url}\n\nI see you've provided a link to \`x.com\`. Please consider posting a new message having \`x.com\` replaced with \`xcancel.com\`, that way server members may view the message and thread without requiring an account.\n\n${updatedPhrase}\`\`\`${updatedLinkList}\`\`\`\n\nHere is your entire message with adjusted links:\n\`\`\`${updatedLinkList}\`\`\``,
		);

		return; // mission complete
	} catch (e) {
		// assume user disabled DMs upon error
	}

	// Plan B: inline reply
	try {
		await message.reply(
			`I converted your \`x.com\` links to use \`xcancel.com\` so that server members won't require an account to view content and threads.\n\n${updatedLinkList}`,
		);
	} catch (e) {
		// don't handle failures
	}
}
