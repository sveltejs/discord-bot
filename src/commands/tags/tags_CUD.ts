import type { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { DEV_MODE } from '../../config';
import type { Tag } from './tags_read';
import { tagCreateCommandHandler } from './_tags_create';
import { tagDeleteCommandHandler } from './_tags_delete';
import { tagUpdateCommandHandler } from './_tags_update';

const enum Actions {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
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
					description: 'The exact name of the tag to edit',
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

	run: async ({ interaction, client }) => {
		const subcommand = interaction.options.getSubcommand() as Actions;
		const tagName = interaction.options
			.getString('name', true)
			.toLowerCase();
		const supabase: SupabaseClient = client.props.get('supabase');

		const { data: tags, error } = await supabase
			.from<Tag>('tags')
			.select('*')
			.eq('tag_name', tagName)
			.limit(1);
		if (error) return;
		const tag = tags?.[0];

		try {
			switch (subcommand) {
				case Actions.CREATE: {
					await tagCreateCommandHandler({
						tag,
						interaction,
						tagName,
						supabase,
					});
					break;
				}

				case Actions.DELETE: {
					await tagDeleteCommandHandler({
						tag,
						interaction,
						supabase,
						tagName,
						client,
					});
					break;
				}

				case Actions.UPDATE: {
					await tagUpdateCommandHandler({
						tag,
						interaction,
						tagName,
						client,
						supabase,
					});
					break;
				}
			}
		} catch {
			// Do something with the errors
		}
	},
});
