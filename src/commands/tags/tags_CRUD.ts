import { command } from 'jellycommands';
import { tag_create_handler } from './_tags_create.js';
import { tag_delete_handler } from './_tags_delete.js';
import { tag_update_handler } from './_tags_update.js';
import { tag_list_handler } from './_tags_list.js';

const enum Actions {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
	LIST = 'list',
}

const handlers = {
	[Actions.CREATE]: tag_create_handler,
	[Actions.UPDATE]: tag_update_handler,
	[Actions.DELETE]: tag_delete_handler,
	[Actions.LIST]: tag_list_handler,
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
		{
			name: Actions.LIST,
			type: 'SUB_COMMAND',
			description: 'List all tags',
		},
	],

	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand() as Actions;
		// Make tag names case insensitive to disallow similar names and avoid confusion
		// because it won't be null if the subcommand is create, update or delete
		// and we don't care about tag_name in list
		const tag_name = interaction.options
			.getString('name', subcommand !== Actions.LIST)!
			.toLowerCase();

		try {
			await handlers[subcommand]({ interaction, tag_name });
		} catch {
			// Do something with the errors
		}
	},
});
