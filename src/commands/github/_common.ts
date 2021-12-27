import { CommandInteraction } from 'discord.js';
import fetch, { Headers } from 'node-fetch';
import { GITHUB_TOKEN } from '../../config.js';
import { listOfLinks } from '../../utils/embedBuilder.js';
import { REPOS, REPO_DETAILS } from '../../utils/repositories.js';

async function githubSearch(body: {
	query: string;
	variables: Record<string, string>;
}) {
	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: new Headers({
			Authorization: `Bearer ${GITHUB_TOKEN}`,
			'Content-Type': 'application/json',
		}),
	});
	if (!res.ok) {
		return null;
	}
	const results: Array<Record<string, any>> = ((await res.json()) as any).data
		.search.nodes;
	if (!results.length) {
		return null;
	}
	return listOfLinks(
		results.map(
			(result) => `#[${result.number}](${result.url}): ${result.title}`,
		),
	);
}

export async function githubCommandHandler(
	interaction: CommandInteraction,
	query: string,
	is?: 'issue' | 'pr',
) {
	const thisRepoDetails =
		REPO_DETAILS[
			interaction.options.getInteger('repository', true) as REPOS
		];
	const topic = interaction.options.getString('topic');

	const searchQuery = `${is ? `is:${is}` : ''} repo:${
		thisRepoDetails.REPOSITORY_NAME
	} ${topic || ''}`;

	try {
		let results = await githubSearch({
			query,
			variables: {
				searchQuery,
			},
		});

		if (results) {
			await interaction.reply({
				embeds: [results],
			});
		} else {
			await interaction.reply({
				content: 'No results found.',
				ephemeral: true,
			});
		}
	} catch {
		// TODO: Do nothing or log the error or something
	}
}
