import fetch from 'node-fetch';
import flexsearch from 'flexsearch';

let cache: {
	index: flexsearch.Index;
	lookup: Map<Tutorial['slug'], Tutorial['name']>;
};

interface Tutorial {
	name: string;
	slug: string;
}

interface TutorialSection {
	name: string;
	tutorials: Tutorial[];
}

async function build_cache() {
	const res = await fetch('https://api.svelte.dev/docs/svelte/tutorial');
	if (!res.ok) throw new Error("Couldn't fetch tutorials.");
	const data = (await res.json()) as TutorialSection[];

	const index = new flexsearch.Index({
		tokenize: 'forward',
	});
	const lookup: typeof cache['lookup'] = new Map();

	for (const section of data) {
		for (const tutorial of section.tutorials) {
			const title = `${section.name}: ${tutorial.name}`;
			lookup.set(tutorial.slug, title);
			index.add(tutorial.slug, title);
		}
	}

	return (cache = { index, lookup });
}

export async function search_tutorials(
	query: string,
	{ limit = 1, as_link = true } = {},
) {
	const { index, lookup } = cache ?? (await build_cache());

	const results = await index.searchAsync(query, {
		limit,
	});

	return results.map((slug) => {
		const title = lookup.get(slug.toString())!;
		return as_link
			? `[${title}](https://svelte.dev/tutorial/${slug})`
			: title;
	});
}
