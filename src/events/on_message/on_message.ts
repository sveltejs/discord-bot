import { event } from 'jellycommands';
import autothread from './_autothread.js';
import check_links from './_check_links.js';
import { STOP } from './_common.js';
import spam_filter from './_spam_filter.js';

export default event({
	name: 'messageCreate',

	async run(_, message) {
		if (message.author.bot || !message.inGuild()) return;

		for (const handler of [spam_filter, check_links, autothread]) {
			try {
				await handler(message);
			} catch (e) {
				if (e === STOP) return;
				console.error(handler.name, '\n', e);
				break;
			}
		}
	},
});
