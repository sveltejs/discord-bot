import { ChannelType, type Message, type Client } from 'discord.js';
import { MOD_LOGS_CHANNEL } from '../config.ts';

/** Send a message to a moderator-visible channel */
export async function mod_log(client: Client, message: string) {
	const mod_logs_channel = await client.channels.fetch(MOD_LOGS_CHANNEL);

	if (mod_logs_channel && mod_logs_channel.type === ChannelType.GuildText) {
		await mod_logs_channel.send(message);
	} else {
		console.error('failed to find mod logs channel');
	}
}

/** Forward a message to a moderator-visible channel */
export async function mod_forward(message: Message) {
	await message.forward(MOD_LOGS_CHANNEL);
}
