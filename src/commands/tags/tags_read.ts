import type { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { DEV_MODE } from '../../config.js';
import {
	list_embed_builder,
	tags_embed_builder,
} from '../../utils/embed_helpers.js';
import { Tag } from './_common.js';

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

	run: async ({ interaction, client }) => {
		const tag_name = interaction.options
			.getString('name', true)
			.toLowerCase(); // Make tag names case insensitive to disallow similar names and avoid confusion
		const supabase: SupabaseClient = client.props.get('supabase');

		const { data: tags } = await supabase
			.from<Tag>('tags')
			.select('*')
			.eq('tag_name', tag_name)
			.limit(1);

		const tag = tags?.[0];

		try {
			if (!tag) {
				const defer_promise = interaction.deferReply({
					ephemeral: true,
				});
				const { data: close_matches } = await supabase.rpc<Tag>(
					'matching_tags',
					{
						to_search: tag_name,
					},
				);
				await defer_promise;
				await interaction.followUp({
					content: `No tag found with that name, remember tag names have to be exact. ${
						close_matches?.length ? 'Did you mean?' : ''
					}`,
					embeds: close_matches?.length
						? [
								list_embed_builder(
									close_matches.map(
										(t) => `\`${t.tag_name}\``,
									),
								),
						  ]
						: undefined,
				});
				return;
			}
			await interaction.reply({
				embeds: [
					tags_embed_builder({
						tag_name,
						tag_content: tag.tag_content,
						author: client.users.cache.get(tag.author_id),
					}),
				],
			});
		} catch {
			// Do something with the errors
		}
	},
});
