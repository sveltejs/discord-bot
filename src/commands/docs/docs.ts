import { Repos, RepositoryDetails } from '../../utils/repositories.js';
import { into_name_value_pair } from '../../utils/autocomplete.js';
import { list_embed_builder } from '../../utils/embed_helpers.js';
import { wrap_in_embed } from '../../utils/embed_helpers.js';
import { search_docs } from './_docs_cache.js';
import { no_op } from '../../utils/promise.js';
import { command } from 'jellycommands';

function get_repo(subcommand: string) {
	return subcommand == 'svelte' ? Repos.SVELTE : Repos.SVELTE_KIT;
}

export default command({
	name: 'docs',
	description: 'Search svelte or sveltekit docs',
	global: true,

	options: [
		{
			name: 'svelte',
			type: 'Subcommand',
			description: 'Search svelte docs',
			options: [
				{
					name: 'query',
					type: 'String',
					description: 'The string to search for in the docs.',
					autocomplete: true,
				},
			],
		},
		{
			name: 'sveltekit',
			type: 'Subcommand',
			description: 'Search sveltekit docs',
			options: [
				{
					name: 'query',
					type: 'String',
					description: 'The string to search for in the docs.',
					autocomplete: true,
				},
			],
		},
	],

	run: async ({ interaction }) => {
		const repo = get_repo(interaction.options.getSubcommand(true));

		const repo_details = RepositoryDetails[repo];
		const query = interaction.options.getString('query');

		try {
			if (!query) {
				await interaction.reply(
					wrap_in_embed(
						`[${repo_details.NAME} Docs](${repo_details.HOMEPAGE}/docs)`,
					),
				);
				return;
			}

			const results = await search_docs(query, repo);

			if (!results.length) {
				await interaction.reply({
					content:
						'No matching result found. Try again with a different search term.',
					ephemeral: true,
				});
				return;
			}

			await interaction.reply({
				embeds: [
					list_embed_builder(results, `${repo_details.NAME} Docs`),
				],
			});
		} catch {
			await interaction.reply({
				content: 'An error occurred while searching the docs.',
				ephemeral: true,
			});
		}
	},

	autocomplete: async ({ interaction }) => {
		const focused = interaction.options.getFocused(true);
		if (focused.name !== 'query') return;

		const query = focused.value as string;
		if (!query) return await interaction.respond([]);

		const repo = get_repo(interaction.options.getSubcommand(true));

		const results = await search_docs(query, repo, {
			limit: 10,
			as_link: false,
		});

		await interaction
			.respond(results.map(into_name_value_pair))
			.catch(no_op);
	},
});
