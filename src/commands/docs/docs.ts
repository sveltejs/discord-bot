import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import fuzzysort from 'fuzzysort';
import { command } from 'jellycommands';
import fetch from 'node-fetch';
import { DEV_MODE, SVELTE_ORANGE } from '../../config.js';
import { listOfLinks } from '../../utils/embedBuilder.js';
import { REPOS, REPO_DETAILS } from '../../utils/repositories.js';

export default command({
	name: 'docs',
	description: 'Search svelte or sveltekit docs',
	global: true,
	dev: DEV_MODE,
	options: [
		{
			name: 'project',
			type: ApplicationCommandOptionTypes.INTEGER,
			description: 'Which project to search the docs of',
			choices: [
				{
					name: 'Svelte',
					value: REPOS.SVELTE,
				},
				{
					name: 'SvelteKit',
					value: REPOS.SVELTEKIT,
				},
			],
			required: true,
		},
		{
			name: 'topic',
			type: ApplicationCommandOptionTypes.STRING,
			description: 'The topic to search for in the docs.',
		},
	],

	run: async ({ interaction }) => {
		const repo: REPOS.SVELTE | REPOS.SVELTEKIT =
			interaction.options.getInteger('project', true);
		const thisRepoDetails = REPO_DETAILS[repo];
		const topic = interaction.options.getString('topic');

		try {
			if (!topic) {
				await interaction.reply({
					embeds: [
						{
							description: `[${thisRepoDetails.NAME} Docs](${thisRepoDetails.DOCS_URL})`,
							color: SVELTE_ORANGE,
						},
					],
				});
				return;
			}
			if (!thisRepoDetails.DOCS_CACHE) {
				await buildDocsCache(repo);
			}
			const docsCache = thisRepoDetails.DOCS_CACHE!;
			const results = fuzzysort.go(topic, Object.keys(docsCache), {
				limit: 5,
			});

			if (results.total === 0) {
				await interaction.reply({
					content:
						'No matching result found. Try again with a different search term.',
					ephemeral: true,
				});
				return;
			}

			await interaction.reply({
				embeds: [
					listOfLinks(
						results.map(
							(result) =>
								`[${result.target}](${
									thisRepoDetails.DOCS_URL
								}#${docsCache[result.target]})`,
						),
					),
				],
			});
		} catch {
			// Do something with the errors
		}
	},
});

async function buildDocsCache(project: REPOS) {
	const res = await fetch(REPO_DETAILS[project].DOCS_API_URL as string);

	if (res.ok) {
		const data: DocsSection[] = await res.json();

		let flattened: Record<string, string> = {};

		for (let section of data) {
			flattened = { ...flattened, ...flattenSection(section) };
		}

		REPO_DETAILS[project].DOCS_CACHE = flattened;
	}
}

function flattenSection(section: DocsSection) {
	let subsections: Record<string, string> = {};

	subsections[section.title] = section.slug;

	for (let subsection of section.sections) {
		subsections = { ...subsections, ...flattenSection(subsection) };
	}

	return subsections;
}

type DocsSection = {
	slug: string;
	title: string;
	sections: Array<DocsSection>;
};
