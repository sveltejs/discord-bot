import { into_name_value_pair } from '../../utils/autocomplete.js';
import { tags_embed_builder } from '../../utils/embed_helpers.js';
import { list_embed_builder } from '../../utils/embed_helpers.js';
import { get_matching_tag_names, get_tag } from './_common.js';
import { get_member } from '../../utils/snowflake.js';
import { command } from 'jellycommands';

export default command({
	name: 'tag',
	description: 'Read a tag',
	global: true,
	options: [
		{
			name: 'name',
			description: 'The exact name of the tag to view',
			type: 'String',
			required: true,
			autocomplete: true,
		},
	],

	run: async ({ interaction }) => {
		const tag_name = interaction.options
			.getString('name', true)
			.toLowerCase(); // Make tag names case insensitive to disallow similar names and avoid confusion

		const tag = await get_tag(tag_name);

		if (tag) {
			await interaction.reply({
				embeds: tags_embed_builder({
					tag_name,
					tag_content: tag.content,
					author: await get_member(interaction, tag.author_id),
				}),
			});
			return;
		}

		const defer = interaction.deferReply({
			ephemeral: true,
		});

		const matching_tags = await get_matching_tag_names(tag_name);

		await defer;
		await interaction.followUp({
			content: "No tag found with that name, remember tag names have to be exact.",
			embeds: matching_tags && [
				list_embed_builder(
					matching_tags.map((t) => `\`${t}\``),
					'Did you mean?',
				),
			],
		});
	},

	autocomplete: async ({ interaction }) => {
		const focused = interaction.options.getFocused(true);

		if (focused.name !== 'name') return;
		const name = focused.value as string;

		if (!name) return await interaction.respond([]);

		const matching_tags = await get_matching_tag_names(name);
		await interaction.respond(
			matching_tags ? matching_tags.map(into_name_value_pair) : [],
		);
	},
});
