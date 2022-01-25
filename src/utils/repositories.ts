export enum Repos {
	'SVELTE' = 1,
	'SVELTE_KIT' = 2,
	'RFCS' = 3,
	'LANGUAGE_TOOLS' = 4,
}

export const RepositoryDetails: Record<Repos, RepoInfo> = {
	1: {
		NAME: 'Svelte',
		DOCS_API_URL: 'https://api.svelte.dev/docs/svelte/docs',
		DOCS_URL: 'https://svelte.dev/docs',
		REPOSITORY_NAME: 'sveltejs/svelte',
	},
	2: {
		NAME: 'SvelteKit',
		DOCS_API_URL: 'https://api.svelte.dev/docs/kit/docs',
		DOCS_URL: 'https://kit.svelte.dev/docs',
		REPOSITORY_NAME: 'sveltejs/kit',
	},
	3: {
		NAME: 'Svelte RFCs',
		REPOSITORY_NAME: 'sveltejs/rfcs',
	},
	4: {
		NAME: 'Svelte Language Tools',
		REPOSITORY_NAME: 'sveltejs/language-tools',
	},
};

interface RepoInfo {
	NAME: string;
	REPOSITORY_NAME: string;
	DOCS_CACHE?: Record<string, string>;
	DOCS_URL?: string;
	DOCS_API_URL?: string;
}
