import { event } from 'jellycommands';
import { STOP } from './_common.ts';
import { mod_message_delete } from './_mod_msg_delete.ts';

export default event({
	name: 'messageDelete',

	async run(_, message) {
		if (message?.author?.bot || !message.inGuild()) return;

    for (const handler of [
      mod_message_delete
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
