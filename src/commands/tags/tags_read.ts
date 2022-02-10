import { command } from 'jellycommands';
import {
	list_embed_builder,
	tags_embed_builder,
} from '../../utils/embed_helpers.js';
import { get_matching_tag_names, get_member, get_tag } from './_common.js';

export default command({
	name: 'tag',
	description: 'Read a tag',
	global: true,
	options: [
		{
			name: 'name',
			description: 'The exact name of the tag to view',
			type: 'STRING',
			required: true,
		},
	],

	// @ts-expect-error
	run: async ({ interaction }) => {
		const tag_name = interaction.options
			.getString('name', true)
			.toLowerCase(); // Make tag names case insensitive to disallow similar names and avoid confusion

		try {
			const tag = await get_tag(tag_name);

			if (!tag) {
				const defer = interaction.deferReply({
					ephemeral: true,
				});

				const matching_tags = await get_matching_tag_names(tag_name);

				return defer.then(() =>
					interaction.followUp({
						content: `No tag found with that name, remember tag names have to be exact.`,
						embeds: matching_tags
							? [
									list_embed_builder(
										matching_tags,
										'Did you mean?',
									),
							  ]
							: undefined,
					}),
				);
			}

			await interaction.reply({
				embeds: [
					tags_embed_builder({
						tag_name,
						tag_content: tag.tag_content,
						author: await get_member(interaction, tag.author_id),
					}),
				],
			});
		} catch {
			// Do something with the errors
		}
	},
});
