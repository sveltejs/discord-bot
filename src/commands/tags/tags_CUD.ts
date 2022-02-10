import { command } from 'jellycommands';
import { tag_create_handler } from './_tags_create.js';
import { tag_delete_handler } from './_tags_delete.js';
import { tag_update_handler } from './_tags_update.js';

const enum Actions {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
}

const handlers = {
	[Actions.CREATE]: tag_create_handler,
	[Actions.UPDATE]: tag_update_handler,
	[Actions.DELETE]: tag_delete_handler,
};

export default command({
	name: 'tags',
	description: 'Create, edit or delete tags',
	global: true,
	options: [
		{
			name: Actions.CREATE,
			type: 'SUB_COMMAND',
			description: 'Create a tag',
			options: [
				{
					name: 'name',
					description: 'The name of the tag to create',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: Actions.UPDATE,
			type: 'SUB_COMMAND',
			description: 'Update a tag',
			options: [
				{
					name: 'name',
					description: 'The exact name of the tag to edit',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: Actions.DELETE,
			type: 'SUB_COMMAND',
			description: 'Delete a tag',
			options: [
				{
					name: 'name',
					description: 'The exact name of the tag to delete',
					type: 'STRING',
					required: true,
				},
			],
		},
	],

	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand() as Actions;
		const tag_name = interaction.options
			.getString('name', true)
			.toLowerCase(); // Make tag names case insensitive to disallow similar names and avoid confusion

		try {
			await handlers[subcommand]({ interaction, tag_name });
		} catch {
			// Do something with the errors
		}
	},
});
