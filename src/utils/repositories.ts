export enum Repos {
	'SVELTE' = 1,
	'SVELTE_KIT' = 2,
	'RFCS' = 3,
	'LANGUAGE_TOOLS' = 4,
}

export const RepositoryDetails: Record<Repos, RepoInfo> = {
	1: {
		NAME: 'Svelte',
		HOMEPAGE: 'https://svelte.dev',
		REPOSITORY_NAME: 'sveltejs/svelte',
	},
	2: {
		NAME: 'SvelteKit',
		HOMEPAGE: 'https://kit.svelte.dev',
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
	HOMEPAGE?: string;
}
