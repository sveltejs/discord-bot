import { type Repos, RepositoryDetails } from '../../utils/repositories.js';
import { list_embed_builder } from '../../utils/embed_helpers.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { GITHUB_TOKEN } from '../../config.js';

const query =
	`query searchResults($search_string: String!, $type: SearchType!, $num: Int!) {
		search(type: $type, query: $search_string, first: $num) {
			nodes {
				... on Discussion {
					title
					number
					url
				}
				... on Issue {
					title
					number
					url
				}
				... on PullRequest {
					title
					number
					url
				}
			}
		}
	}`
		.replace(/\t/g, '')
		.replace(/\n}/g, '}') // Indentation doesn't matter so shave some bytes from the payload
		.trimStart();

/**
 * Query the Github GraphQL API
 *
 * @returns `null` if there was an error or if there were 0 results
 * otherwise a `string[]` of formatted links to the results.
 */
async function search_github(
	search_string: string,
	type: 'DISCUSSION' | 'ISSUE', // The API doesn't distinguish between issues and PRs here.
	/**
	 * The maximum number of results to return.
	 * @default {5}
	 */
	num = 5,
) {
	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		body: JSON.stringify({
			query,
			variables: {
				search_string,
				type,
				num,
			},
		}),
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`,
			'Content-Type': 'application/json',
		},
	});

	if (!res.ok) return null;

	// biome-ignore lint/suspicious/noExplicitAny: laziness
	const body = (await res.json()) as Record<string, any>;

	const results: SearchResult[] = body.data.search.nodes;

	return results?.length
		? results.map(
				(result) =>
					`[#${result.number}](${result.url}): ${result.title}`,
			)
		: null;
}

export async function github_command_handler(
	interaction: ChatInputCommandInteraction,
	type: GithubResultType,
) {
	const repo_name =
		RepositoryDetails[
			interaction.options.get('repository', true).value as Repos
		].REPOSITORY_NAME;

	const topic = interaction.options.get('topic')?.value;

	const search_string = `repo:${repo_name} ${topic ?? ''} ${
		type === GithubResultType.ISSUE
			? 'is:issue'
			: type === GithubResultType.PULL_REQUEST
				? 'is:pr'
				: '' // Discussion ignores the `is:` filter
	}`;

	const results = await search_github(
		search_string,
		type === GithubResultType.DISCUSSION ? 'DISCUSSION' : 'ISSUE',
	);

	await interaction.reply(
		results
			? {
					embeds: [list_embed_builder(results)],
				}
			: {
					content: 'No results found.',
					ephemeral: true,
				},
	);
}

export enum GithubResultType {
	ISSUE = 0,
	PULL_REQUEST = 1,
	DISCUSSION = 2,
}

interface SearchResult {
	title: string;
	url: string;
	number: number;
}
