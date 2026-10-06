import {
	ChannelType,
	PermissionFlagsBits,
	type ChatInputCommandInteraction,
	type ThreadChannel,
} from 'discord.js';

export async function create_breakout(
	interaction: ChatInputCommandInteraction,
) {
	const source = await interaction.channel?.fetch();
	if (!source?.isThread() || !interaction.guild) {
		await interaction.followUp('Use /breakout inside a thread.');
		return;
	}
	if (source.type === ChannelType.PrivateThread) {
		await interaction.followUp(
			'Private threads cannot be broken out into public threads.',
		);
		return;
	}
	if (source.archived || source.locked) {
		await interaction.followUp(
			'Use /breakout in an active, unlocked thread.',
		);
		return;
	}
	const parent = await interaction.guild.channels.fetch(source.parentId!);
	if (
		parent?.type !== ChannelType.GuildText &&
		parent?.type !== ChannelType.GuildForum
	) {
		await interaction.followUp(
			'Breakouts need a text channel or forum as their parent.',
		);
		return;
	}
	const member = await interaction.guild.members.fetch(interaction.user.id);
	const bot = await interaction.guild.members.fetchMe();
	const creation_permission =
		parent.type === ChannelType.GuildForum
			? PermissionFlagsBits.SendMessages
			: PermissionFlagsBits.CreatePublicThreads;
	const needed = [
		PermissionFlagsBits.ViewChannel,
		PermissionFlagsBits.SendMessagesInThreads,
		creation_permission,
	];
	if (
		!parent.permissionsFor(member)?.has(needed) ||
		!source
			.permissionsFor(member)
			?.has(PermissionFlagsBits.SendMessagesInThreads)
	) {
		await interaction.followUp(
			'You need permission to create a thread here and send messages in it.',
		);
		return;
	}
	if (
		!parent.permissionsFor(bot)?.has(needed) ||
		!source
			.permissionsFor(bot)
			?.has(PermissionFlagsBits.SendMessagesInThreads)
	) {
		await interaction.followUp(
			'I need permission to create threads here and send messages in both threads.',
		);
		return;
	}
	const title = interaction.options.getString('title');
	const name = (title ?? `Breakout: ${source.name}`).trim().slice(0, 100);
	if (!name) {
		await interaction.followUp('The title cannot be empty.');
		return;
	}
	const origin = `https://discord.com/channels/${source.guild.id}/${source.id}`;
	const message = {
		content: `Discussion continued from ${origin}`,
		allowedMentions: { parse: [] as never[] },
	};
	let breakout: ThreadChannel | undefined;
	try {
		if (parent.type === ChannelType.GuildForum) {
			breakout = await parent.threads.create({
				name,
				message,
				appliedTags: source.appliedTags.filter((id) =>
					parent.availableTags.some((tag) => tag.id === id),
				),
			});
		} else {
			breakout = await parent.threads.create({
				name,
				type: ChannelType.PublicThread,
			});
			await breakout.send(message);
		}
		await source.send({
			content: `Continue this discussion in <#${breakout.id}>`,
			allowedMentions: { parse: [] },
		});
		await interaction.followUp({
			content: `Created <#${breakout.id}>`,
			allowedMentions: { parse: [] },
		});
	} catch {
		await interaction.followUp({
			content: breakout
				? `Created <#${breakout.id}>, but could not finish linking the discussions. Check that thread before trying again.`
				: 'Unable to create the breakout. Check thread permissions and required forum tags, then try again.',
			allowedMentions: { parse: [] },
		});
	}
}
