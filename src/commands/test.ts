import { command } from 'jellycommands';

export default command({
	name: 'test',
	description: 'Testing that the bot works fine',

	global: true,
	dev: true,

	run: ({ interaction }) =>
		interaction.reply({ embeds: [{ description: 'Hello World!' }] }),
});
