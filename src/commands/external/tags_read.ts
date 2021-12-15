import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { DEV_MODE } from '../../config';

export default command({
	name: 'tag',
	description: 'Read a tag',
	global: true,
	dev: DEV_MODE,
	options: [
		{
			name: 'name',
			description: 'The exact name of the tag to view',
			type: ApplicationCommandOptionTypes.STRING,
			required: true,
		},
	],
	disabled: true,

	run: async ({ interaction }) => {
		const tagName = interaction.options.getString('name', true);
	},
});
