import { command } from 'jellycommands';
import { trgm_search } from 'js-trgm';
import { DEV_MODE } from '../../config.js';
import { build_embed, list_embed_builder } from '../../utils/embed_helpers.js';
import { Repos, RepositoryDetails } from '../../utils/repositories.js';
import { get_docs } from './_docs_cache.js';

export default command({
	name: 'docs',
	description: 'Search svelte or sveltekit docs',
	global: true,
	dev: DEV_MODE,
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
			name: 'topic',
			type: 'STRING',
			description: 'The topic to search for in the docs.',
		},
	],

	run: async ({ interaction }) => {
		const repo: Repos.SVELTE | Repos.SVELTE_KIT =
			interaction.options.getInteger('project', true);
		const repo_details = RepositoryDetails[repo];
		const topic = interaction.options.getString('topic');

		try {
			if (!topic)
				return interaction.reply({
					embeds: [
						build_embed({
							description: `[${repo_details.NAME} Docs](${repo_details.DOCS_URL})`,
						}),
					],
				});

			const cached_docs = await get_docs(repo);

			const results = trgm_search(topic, Object.keys(cached_docs), {
				limit: 5,
			});

			if (results.length === 0)
				return interaction.reply({
					content:
						'No matching result found. Try again with a different search term.',
					ephemeral: true,
				});

			await interaction.reply({
				embeds: [
					list_embed_builder(
						results.map(
							(result) =>
								`[${result.target}](${repo_details.DOCS_URL}#${
									cached_docs[result.target]
								})`,
						),
					),
				],
			});
		} catch {
			// Do something with the errors
		}
	},
});
