import check_links from './_check_links.js';
import spam_filter from './_spam_filter.js';
import autothread from './_autothread.js';
import slow_mode from './_slow_mode.js';
import advise from './_advise.js';
import { event } from 'jellycommands';
import { STOP } from './_common.js';

export default event({
	name: 'messageCreate',

	async run(_, message) {
		if (message.author.bot || !message.inGuild()) return;

		for (const handler of [
			spam_filter,
			check_links,
			autothread,
			slow_mode,
			advise,
		]) {
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
