import check_links from './_check_links.ts';
import spam_filter from './_spam_filter.ts';
import autothread from './_autothread.ts';
import slow_mode from './_slow_mode.ts';
import advise from './_advise.ts';
import { event } from 'jellycommands';
import { STOP } from './_common.ts';

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
