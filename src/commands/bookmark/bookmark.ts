import { messageCommand } from 'jellycommands';

export default messageCommand({
	name: 'bookmark',
	global: true,

	run: async ({ interaction }) => {
		const message = interaction.options.getMessage('message', true);
		const link = await interaction.channel?.messages
			.fetch(message.id)
			.then((m) => m.url);

		const content = message.content.slice(
			0,
			2000 - (link?.length ? link.length + 1 : 0),
		);

		await Promise.allSettled([
			interaction.user.send(`${link}\n${content}`),
			interaction.reply({
				content: "I've sent this message to your DMs!",
				ephemeral: true,
			}),
		]);
	},
});
