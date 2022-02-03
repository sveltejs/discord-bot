import { CommandInteraction } from 'discord.js';
import fetch, { Headers } from 'node-fetch';
import { GITHUB_TOKEN } from '../../config.js';
import { list_embed_builder } from '../../utils/embed_helpers.js';
import { Repos, RepositoryDetails } from '../../utils/repositories.js';

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
		headers: new Headers({
			Authorization: `Bearer ${GITHUB_TOKEN}`,
			'Content-Type': 'application/json',
		}),
	});

	if (!res.ok) return null;

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
	interaction: CommandInteraction,
	type: GithubResultType,
) {
	const repo_name =
		RepositoryDetails[
			interaction.options.getInteger('repository', true) as Repos
		].REPOSITORY_NAME;

	const topic = interaction.options.getString('topic');

	const search_string = `repo:${repo_name} ${topic ?? ''} ${
		type === GithubResultType.ISSUE
			? 'is:issue'
			: type === GithubResultType.PULL_REQUEST
			? 'is:pr'
			: '' // Discussion ignores the `is:` filter
	}`;

	try {
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
	} catch {
		// TODO: Do nothing or log the error or something
	}
}

export const enum GithubResultType {
	ISSUE,
	PULL_REQUEST,
	DISCUSSION,
}

interface SearchResult {
	title: string;
	url: string;
	number: number;
}
