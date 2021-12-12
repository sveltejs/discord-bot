export enum REPOS {
	'SVELTE' = 1,
	'SVELTEKIT' = 2,
	'RFCS' = 3,
	'LANGUAGETOOLS' = 4,
}

export const REPO_DETAILS: Record<REPOS, REPO_DETAILS> = {
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

interface REPO_DETAILS {
	NAME: string;
	REPOSITORY_NAME: string;
	DOCS_CACHE?: Record<string, string>;
	DOCS_URL?: string;
	DOCS_API_URL?: string;
}
