import fetch from 'node-fetch';

let cached_tutorials: Record<string, string>;

interface Tutorial {
	name: string;
	slug: string;
}

interface TutorialSection {
	name: string;
	tutorials: Tutorial[];
}

/**
 * Get a `title: slug` record of sections of the Svelte tutorial.
 */
export async function get_tutorials() {
	if (cached_tutorials) return cached_tutorials;

	const res = await fetch('https://api.svelte.dev/docs/svelte/tutorial');

	if (res.ok) {
		const data = (await res.json()) as Array<TutorialSection>;
		cached_tutorials = {};

		for (const section of data) {
			for (const tutorial of section.tutorials) {
				const title = `${section.name}: ${tutorial.name}`;
				cached_tutorials[title] = tutorial.slug;
			}
		}
	}
	return cached_tutorials;
}
