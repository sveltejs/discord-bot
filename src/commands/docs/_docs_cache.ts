import { Repos, RepositoryDetails } from '../../utils/repositories.js';

const cache = new Map<Repos, Record<string, string>>();

/**
 * Get a `title: slug` record of sections of the Svelte or SvelteKit docs.
 */
export async function get_docs(project: Repos.SVELTE | Repos.SVELTE_KIT) {
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

	for (let subsection of section.sections) {
		subsections = { ...subsections, ...flatten_section(subsection) };
	}

	return subsections;
}

type DocsSection = {
	slug: string;
	title: string;
	sections: Array<DocsSection>;
};
