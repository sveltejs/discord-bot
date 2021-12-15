import { Message } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { DEV_MODE } from '../../config';

const enum Actions {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
}

export default command({
	name: 'tags',
	description: 'Create, edit or delete tags',
	disabled: true,
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
	],

	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand() as Actions;

		switch (subcommand) {
			case Actions.CREATE: {
				const tagName = interaction.options.getString('name', true);

				await interaction.reply({
					content:
						'Send the contents for the tag in this channel within the next 60 seconds.',
					ephemeral: true,
				});

				let messageColl = await interaction.channel?.awaitMessages({
					time: 60_000,
					filter: (message: Message) =>
						message.author === interaction.user,
					max: 1,
				});
				if (!messageColl?.size) {
					await interaction.editReply({
						content: 'No content received for the tag. Aborting.',
					});
					return;
				}
				// TODO: Add the tag to the database, send an error if a tag with the same name exists already

				break;
			}

			case Actions.DELETE: {
				const tagName = interaction.options.getString('name', true);
				const tag = {}; // Get the tag from the database
				if (
					true
					/* TODO: Check if a tag with that name exists, 
					and the command executor has the permissions to delete it 
					(ie is the author or a moderator) 
					*/
				) {
					await interaction.reply({
						content:
							"Either that tag doesn't exist or you don't have the permissions to delete it.",
						ephemeral: true,
					});
					return;
				}
				// Otherwise delete it from the db
				break;
			}

			case Actions.UPDATE: {
				const tagName = interaction.options.getString('name', true);
				const tag = {}; // Get the tag from the database
				if (
					true
					/* TODO: Check if a tag with that name exists, 
					and the command executor has the permissions to edit it 
					(ie is the author) 
					*/
				) {
					await interaction.reply({
						content:
							"Either that tag doesn't exist or you don't have the permissions to delete it. Only the author of the tag can delete it",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					content:
						'Send the new contents for the tag in this channel within the next 60 seconds.',
					ephemeral: true,
				});

				let messageColl = await interaction.channel?.awaitMessages({
					time: 60_000,
					filter: (message: Message) =>
						message.author === interaction.user,
					max: 1,
				});

				if (!messageColl?.size) {
					await interaction.editReply({
						content: 'No content received for the tag. Aborting.',
					});
					return;
				}
				// Otherwise update the tag in the database
			}
		}
	},
});
