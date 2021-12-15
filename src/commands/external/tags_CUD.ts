import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { DEV_MODE } from '../../config';

enum Actions {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
	ALIAS = 'alias',
}

export default command({
	name: 'tags',
	description: 'Create, edit or delete tags',
	global: true,
	dev: DEV_MODE,
	options: [
		{
			name: Actions.CREATE,
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			description: 'Create a tag',
			options: [
				{
					name: 'name',
					description: 'The name of the tag to create',
					type: ApplicationCommandOptionTypes.STRING,
					required: true,
				},
			],
		},
		{
			name: Actions.UPDATE,
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			description: 'Update a tag',
			options: [
				{
					name: 'name',
					description: 'The exact name of the tag to create',
					type: ApplicationCommandOptionTypes.STRING,
					required: true,
				},
			],
		},
		{
			name: Actions.DELETE,
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			description: 'Delete a tag',
			options: [
				{
					name: 'name',
					description: 'The exact name of the tag to delete',
					type: ApplicationCommandOptionTypes.STRING,
					required: true,
				},
			],
		},
		{
			name: Actions.ALIAS,
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			description: 'Alias a tag with another name',
			options: [
				{
					name: 'name',
					type: ApplicationCommandOptionTypes.STRING,
					description: 'The name of the tag to create an alias to',
					required: true,
				},
				{
					name: 'alias',
					type: ApplicationCommandOptionTypes.STRING,
					description: 'The alias for the tag',
					required: true,
				},
			],
		},
	],

	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand() as Actions;

		switch (subcommand) {
			case Actions.CREATE: {
				interaction.reply('Creating...');
				break;
			}

			case Actions.DELETE: {
				interaction.reply('Deleting...');
				break;
			}

			case Actions.UPDATE: {
				interaction.reply('Updating...');
				break;
			}

			case Actions.ALIAS: {
				interaction.reply('Creating alias...');
				break;
			}
		}
	},
});
