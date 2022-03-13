import flexsearch from 'flexsearch';
import fetch from 'node-fetch';
import { Repos, RepositoryDetails } from '../../utils/repositories.js';

const cache = new Map<
	Repos,
	{
		index: flexsearch.Index;
		lookup: Map<Block['href'], string>;
	}
>();

async function build_cache(repo: Repos) {
	let blocks: Block[];

	if (repo === Repos.SVELTE) {
		const response = await fetch('https://api.svelte.dev/docs/svelte/docs');
		blocks = transform_svelte_docs(
			(await response.json()) as DocsSection[],
		);
	} else {
		const response = await fetch('https://kit.svelte.dev/content.json');
		blocks = ((await response.json()) as { blocks: Block[] }).blocks;
	}

	// Build the index using the same settings as the site
	// Adapted from: https://github.com/sveltejs/kit/blob/fdbd9d5d1a4146b3184273ecfad47da9c0261986/sites/kit.svelte.dev/src/lib/search/SearchBox.svelte#L21
	const index = new flexsearch.Index({
		tokenize: 'forward',
	});
	const lookup = new Map<Block['href'], string>();

	for (const block of blocks) {
		const title = block.breadcrumbs.at(-1);
		lookup.set(block.href, block.breadcrumbs.join('/'));
		index.add(block.href, `${title} ${block.content}`);
	}

	const cache_entry = { index, lookup };
	cache.set(repo, cache_entry);
	return cache_entry;
}

export async function search_docs(
	query: string,
	repo: Repos,
	{ limit = 5, as_link = true } = {},
) {
	const { index, lookup } = cache.get(repo) ?? (await build_cache(repo));

	const results = await index.searchAsync(query, {
		limit,
	});

	return results.map((href) => {
		const link_text = lookup.get(href.toString())!;

		const link = `${RepositoryDetails[repo].HOMEPAGE}${href.toString()}`;

		return as_link ? `[${link_text}](${link})` : link_text;
	});
}

type DocsSection = {
	slug: string;
	title: string;
	sections: Array<DocsSection>;
};

type Block = {
	breadcrumbs: string[];
	href: string;
	content: string;
};

/**
 * Transform the results of the Svelte docs API into a compatible format
 *
 * @todo This is a temporary solution until the API is fixed
 */
function transform_svelte_docs(docs: Array<DocsSection>, parent_block?: Block) {
	let blocks: Block[] = [];

	for (const section of docs) {
		const block: Block = {
			breadcrumbs: [...(parent_block?.breadcrumbs ?? []), section.title],
			href: `/docs#${section.slug}`,
			content: '',
		};
		blocks.push(block);
		blocks = blocks.concat(transform_svelte_docs(section.sections, block));
	}

	return blocks;
}
