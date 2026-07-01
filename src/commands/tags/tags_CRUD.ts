import { tag_create_handler } from './_tags_create.ts';
import { tag_delete_handler } from './_tags_delete.ts';
import { tag_update_handler } from './_tags_update.ts';
import { tag_list_handler } from './_tags_list.ts';
import { command } from 'jellycommands';

const HANDLERS = Object.freeze({
	create: tag_create_handler,
	update: tag_update_handler,
	delete: tag_delete_handler,
	list: tag_list_handler,
});

type Action = keyof typeof HANDLERS;

export default command({
	name: 'tags',
	description: 'Create, edit or delete tags',
	global: true,
	options: [
		{
			name: 'create' as const satisfies Action,
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
			name: 'update' as const satisfies Action,
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
			name: 'delete' as const satisfies Action,
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
			name: 'list' as const satisfies Action,
			type: 'Subcommand',
			description: 'List all tags',
		},
	],

	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand() as Action;
		if (subcommand !== 'list' && !interaction.member) return;

		// Make tag names case insensitive to disallow similar names and avoid confusion
		const tag_name =
			interaction.options
				.getString('name', subcommand !== 'list')
				?.toLowerCase() ?? '';

		if (!tag_name && subcommand !== 'list') {
			await interaction.reply({
				content: 'Unable to find `name` option',
				ephemeral: true,
			});
			return;
		}

		await HANDLERS[subcommand]({ interaction, tag_name });
	},
});
