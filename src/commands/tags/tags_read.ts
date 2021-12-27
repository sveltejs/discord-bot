import type { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { DEV_MODE } from '../../config.js';
import { listOfLinks, tagsEmbedBuilder } from '../../utils/embedBuilder.js';
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
		const tagName = interaction.options
			.getString('name', true)
			.toLowerCase(); // Make tag names case insensitive to disallow similar names and avoid confusion
		const supabase: SupabaseClient = client.props.get('supabase');

		const { data: tags } = await supabase
			.from<Tag>('tags')
			.select('*')
			.eq('tag_name', tagName)
			.limit(1);

		const tag = tags?.[0];

		try {
			if (!tag) {
				const deferPromise = interaction.deferReply({
					ephemeral: true,
				});
				const { data: close_matches } = await supabase.rpc<Tag>(
					'matching_tags',
					{
						to_search: tagName,
					},
				);
				await deferPromise;
				await interaction.followUp({
					content: `No tag found with that name, remember tag names have to be exact. ${
						close_matches?.length ? 'Did you mean?' : ''
					}`,
					embeds: close_matches?.length
						? [
								listOfLinks(
									close_matches?.map(
										(t) => `\`${t.tag_name}\``,
									) as string[],
								),
						  ]
						: undefined,
				});
				return;
			}
			await interaction.reply({
				embeds: [
					tagsEmbedBuilder({
						tagName: tag.tag_name,
						tagContent: tag.tag_content,
						author: client.users.cache.get(tag.author_id),
					}),
				],
			});
		} catch {
			// Do something with the errors
		}
	},
});
