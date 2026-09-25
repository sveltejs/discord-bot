import { event } from 'jellycommands';
import { STOP } from './_common.ts';
import { log_message_deletion } from './_mod_msg_delete.ts';

export default event({
	name: 'messageDelete',

	async run(_, message) {
		if (message?.author?.bot || !message.inGuild()) return;

		for (const handler of [log_message_deletion]) {
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
