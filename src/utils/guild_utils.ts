import { ChannelType, Message, PermissionFlagsBits } from 'discord.js';

export function message_is_in_private_channel(message: Message) {
	const { channel, guild } = message;

	const is_text_channel =
		channel.type === ChannelType.GuildText ||
		channel.type === ChannelType.PublicThread;

	if (!message.inGuild() || !is_text_channel || !guild) return true;

	const everyone_permissions = channel.permissionsFor(guild.roles.everyone);
	return !everyone_permissions.has(PermissionFlagsBits.ViewChannel);
}
