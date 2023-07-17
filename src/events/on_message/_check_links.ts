import { delete_message, fails_link_test, STOP } from './_common.js';
import { wrap_in_embed } from '../../utils/embed_helpers.js';
import { no_op } from '../../utils/promise.js';
import { Message } from 'discord.js';

export default async function check_links(message: Message) {
	if (fails_link_test(message)) {
		try {
			await delete_message(message);
			await message.author
				.send(
					wrap_in_embed(
						`Your message in ${message.channel} was removed since it doesn't contain a link, if you are trying to showcase a project please post a link with your text. Otherwise all conversation should be inside a thread\n\nYour message was sent below so you don't lose it!`,
					),
				)
				.then((new_message) => new_message.reply(message.content))
				.catch(no_op);
		} finally {
			throw STOP;
		}
	}
}
