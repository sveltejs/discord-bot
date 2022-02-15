import { command } from 'jellycommands';
import { build_embed, list_embed_builder } from '../../utils/embed_helpers.js';
import { no_op } from '../../utils/promise.js';
import { Repos, RepositoryDetails } from '../../utils/repositories.js';
import { ReposWithDocs, search_docs } from './_docs_cache.js';

export default command({
	name: 'docs',
	description: 'Search svelte or sveltekit docs',
	global: true,

	options: [
		{
			name: 'project',
			type: 'INTEGER',
			description: 'Which project to search the docs of',
			choices: [
				{
					name: 'Svelte',
					value: Repos.SVELTE,
				},
				{
					name: 'SvelteKit',
					value: Repos.SVELTE_KIT,
				},
			],
			required: true,
		},
		{
			name: 'query',
			type: 'STRING',
			description: 'The string to search for in the docs.',
		},
	],

	run: async ({ interaction }) => {
		const repo: ReposWithDocs = interaction.options.getInteger(
			'project',
			true,
		);

		const repo_details = RepositoryDetails[repo];
		const query = interaction.options.getString('query');

		try {
			if (!query)
				return interaction.reply({
					embeds: [
						build_embed({
							description: `[${repo_details.NAME} Docs](${repo_details.HOMEPAGE}/docs)`,
						}),
					],
				});

			const results = await search_docs(query, repo);

			if (!results.length)
				return interaction.reply({
					content:
						'No matching result found. Try again with a different search term.',
					ephemeral: true,
				});

			await interaction.reply({
				embeds: [
					list_embed_builder(results, `${repo_details.NAME} Docs`),
				],
			});
		} catch {
			interaction
				.reply({
					content: 'An error occurred while searching the docs.',
					ephemeral: true,
				})
				.catch(no_op);
		}
	},
});
