import { trgm_search } from 'js-trgm';
import fetch from 'node-fetch';
import { Repos, RepositoryDetails } from '../../utils/repositories.js';

export type ReposWithDocs = Repos.SVELTE | Repos.SVELTE_KIT;

const cache = new Map<ReposWithDocs, Record<string, string>>();

export async function search_docs(query: string, repo: ReposWithDocs) {
	const cached_docs = await get_docs(repo);
	const repo_details = RepositoryDetails[repo];

	const results = trgm_search(query, Object.keys(cached_docs), {
		limit: 5,
	});

	return results.map(
		// prettier-ignore
		(result) => `[${result.target}](${repo_details.DOCS_URL}${repo === Repos.SVELTE ? '#' : '/'}${cached_docs[result.target]})`,
	);
}

/**
 * Get a `title: slug` record of sections of the Svelte or SvelteKit docs.
 */
export async function get_docs(project: ReposWithDocs) {
	{
		const cached = cache.get(project);
		if (cached) return cached;
	}

	const res = await fetch(RepositoryDetails[project].DOCS_API_URL!);

	const data = (await res.json()) as DocsSection[];

	let flattened: Record<string, string> = {};

	for (let section of data) {
		flattened = { ...flattened, ...flatten_section(section) };
	}

	cache.set(project, flattened);
	return flattened;
}

function flatten_section(section: DocsSection) {
	let subsections: Record<string, string> = {};

	subsections[section.title] = section.slug;

	for (let subsection of section.sections ?? []) {
		subsections = { ...subsections, ...flatten_section(subsection) };
	}

	return subsections;
}

type DocsSection = {
	slug: string;
	title: string;
	sections: Array<DocsSection>;
};
