import { tag_create_handler } from './_tags_create.js';
import { tag_delete_handler } from './_tags_delete.js';
import { tag_update_handler } from './_tags_update.js';
import { tag_list_handler } from './_tags_list.js';
import { command } from 'jellycommands';

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
			type: 'Subcommand',
			description: 'Create a tag',
			options: [
				{
					name: 'name',
					description: 'The name of the tag to create',
					type: 'String',
					required: true,
				},
			],
		},
		{
			name: Actions.UPDATE,
			type: 'Subcommand',
			description: 'Update a tag',
			options: [
				{
					name: 'name',
					description: 'The exact name of the tag to edit',
					type: 'String',
					required: true,
				},
			],
		},
		{
			name: Actions.DELETE,
			type: 'Subcommand',
			description: 'Delete a tag',
			options: [
				{
					name: 'name',
					description: 'The exact name of the tag to delete',
					type: 'String',
					required: true,
				},
			],
		},
		{
			name: Actions.LIST,
			type: 'Subcommand',
			description: 'List all tags',
		},
	],

	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand() as Actions;
		if (subcommand !== Actions.LIST && !interaction.member) return;

		// Make tag names case insensitive to disallow similar names and avoid confusion
		const tag_name = interaction.options
			.getString('name', subcommand !== Actions.LIST)!
			?.toLowerCase();

		await handlers[subcommand]({ interaction, tag_name });
	},
});
