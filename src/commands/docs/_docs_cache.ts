import flexsearch from 'flexsearch';
import fetch from 'node-fetch';
import { Repos, RepositoryDetails } from '../../utils/repositories.js';

const cache = new Map<
	Repos,
	{
		indexes: flexsearch.Index[];
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
	// Adapted from: https://github.com/sveltejs/kit/blob/2ddece81543459f5b2770fafda79e4ac91c9cbbe/sites/kit.svelte.dev/src/lib/search/SearchBox.svelte#L16
	const indexes: flexsearch.Index[] = [];
	const lookup = new Map<Block['href'], string>();

	for (const block of blocks) {
		const title = block.breadcrumbs.at(-1);
		lookup.set(block.href, block.breadcrumbs.join('/'));

		(indexes[block.rank ?? 0] ??= new flexsearch.Index({
			tokenize: 'forward',
		})).add(block.href, `${title} ${block.content}`);
	}

	const cache_entry = { indexes, lookup };
	cache.set(repo, cache_entry);
	return cache_entry;
}

export async function search_docs(
	query: string,
	repo: Repos,
	{ limit = 5, as_link = true } = {},
) {
	const { indexes, lookup } = cache.get(repo) ?? (await build_cache(repo));

	return (
		await Promise.all(
			indexes.map((index) => index.searchAsync(query, { limit })),
		)
	)
		.flat()
		.slice(0, limit)
		.map((href) => {
			// SAFETY: This link is guaranteed to exist since we built the lookup and index together
			const link_text = lookup.get(href.toString())!;

			return as_link
				? // prettier-ignore
				  `[${link_text}](${RepositoryDetails[repo].HOMEPAGE}${href.toString()})`
				: link_text;
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
	rank?: number;
};

/**
 * Transform the results of the Svelte docs API into a compatible format
 *
 * @todo This is a temporary solution until the API is fixed
 */
function transform_svelte_docs(
	docs: Array<DocsSection>,
	parent_block?: Block,
): Block[] {
	return docs.flatMap((section) => {
		const block: Block = {
			breadcrumbs: [...(parent_block?.breadcrumbs ?? []), section.title],
			href: `/docs#${section.slug}`,
			content: '',
		};
		return [block, ...transform_svelte_docs(section.sections, block)];
	});
}
