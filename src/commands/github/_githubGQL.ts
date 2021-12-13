import fetch, { Headers } from 'node-fetch';
import { GITHUB_TOKEN } from '../../config';
import { listOfLinks } from '../../utils/embedBuilder';

export default async function githubSearch(body: {
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
	const results: Array<Record<string, any>> = (await res.json()).data.search
		.nodes;
	if (!results.length) {
		return null;
	}
	return listOfLinks(
		results.map(
			(result) => `#[${result.number}](${result.url}): ${result.title}`,
		),
	);
}
