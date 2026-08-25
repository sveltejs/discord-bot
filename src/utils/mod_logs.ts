import {
	ChannelType,
	type Message,
	type Client,
	TextChannel,
	EmbedBuilder,
} from 'discord.js';
import { MOD_LOGS_CHANNEL } from '../config.ts';
import { LOG_LEVEL_COLOURS } from './embed_helpers.ts';

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

/** Copy a message to a moderator-visible channel */
export async function mod_copy(
	message: Message,
	options?: {
		title?: string;
		pre_content?: string;
		level?: (typeof LOG_LEVEL_COLOURS)[keyof typeof LOG_LEVEL_COLOURS];
	},
) {
	const mod_logs_channel =
		await message.client.channels.fetch(MOD_LOGS_CHANNEL);

	if (mod_logs_channel?.isTextBased()) {
		const pre = options?.pre_content ? `${options.pre_content}\n\n` : '';
		const content = pre + message.content || '*No text content*';

		const embed = new EmbedBuilder()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.author.displayAvatarURL(),
			})
			.setTitle(options?.title ?? null)
			.setDescription(content)
			.setColor(options?.level ?? LOG_LEVEL_COLOURS.INFO)
			.setTimestamp(message.createdAt);

		await (mod_logs_channel as TextChannel).send({
			embeds: [embed],
			files: message.attachments.map((a) => a.url),
		});
	}
}
