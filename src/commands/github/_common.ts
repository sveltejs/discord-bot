import { CommandInteraction } from 'discord.js';
import fetch, { Headers } from 'node-fetch';
import { GITHUB_TOKEN } from '../../config.js';
import { listOfLinks } from '../../utils/embedBuilder.js';
import { Repos, RepositoryDetails } from '../../utils/repositories.js';

const query = `
query searchResults($search_string: String!, $type: SearchType!) {
	search(type: $type, query: $search_string, first: 5) {
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
}`;

/**
 * Query the Github GraphQL API
 *
 * @returns `null` if there was an error or if there were 0 results
 * otherwise a `string[]` of formatted links to the results.
 */
async function githubSearch(
	search_string: string,
	/**
	 * The API doesn't distinguish between issues and PRs here.
	 */
	type: 'DISCUSSION' | 'ISSUE',
) {
	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		body: JSON.stringify({
			query,
			variables: {
				search_string,
				type,
			},
		}),
		headers: new Headers({
			Authorization: `Bearer ${GITHUB_TOKEN}`,
			'Content-Type': 'application/json',
		}),
	});
	if (!res.ok) return null;

	const results: Record<string, any>[] = ((await res.json()) as any).data
		.search.nodes;

	return results?.length
		? results.map(
				(result) =>
					`#[${result.number}](${result.url}): ${result.title}`,
		  )
		: null;
}

export async function githubCommandHandler(
	interaction: CommandInteraction,
	type: GithubResultType,
) {
	const repoName =
		RepositoryDetails[
			interaction.options.getInteger('repository', true) as Repos
		].NAME;

	const topic = interaction.options.getString('topic');

	const search_string = `repo:${repoName} ${topic ?? ''} ${
		type === GithubResultType.ISSUE
			? 'is:issue'
			: type === GithubResultType.PULL_REQUEST
			? 'is:pr'
			: '' // Discussion ignores the `is:` filter
	}`;

	try {
		const results = await githubSearch(
			search_string,
			type === GithubResultType.DISCUSSION ? 'DISCUSSION' : 'ISSUE',
		);

		await interaction.reply(
			results
				? {
						embeds: [listOfLinks(results)],
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
