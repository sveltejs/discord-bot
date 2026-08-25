import { userMention, type Message } from 'discord.js';
import { mod_copy } from '../../utils/mod_logs.ts';

/**
 * Forward deleted messages to mod_logs
 */
export async function log_message_deletion(message: Message) {
	const title = `Message deleted.`;
	const pre_content = `Message by ${userMention(message.author.id)} in ${message.channel} has been deleted.`;

	mod_copy(message, { title, pre_content, level: 'CRITICAL' });
}
