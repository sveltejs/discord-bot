export type Repo = 'svelte' | 'sveltekit' | 'rfcs' | 'language-tools';

export const RepositoryDetails: Record<Repo, RepoInfo> = {
	svelte: {
		NAME: 'Svelte',
		HOMEPAGE: 'https://svelte.dev',
		REPOSITORY_NAME: 'sveltejs/svelte',
	},
	sveltekit: {
		NAME: 'SvelteKit',
		HOMEPAGE: 'https://kit.svelte.dev',
		REPOSITORY_NAME: 'sveltejs/kit',
	},
	rfcs: {
		NAME: 'Svelte RFCs',
		REPOSITORY_NAME: 'sveltejs/rfcs',
	},
	'language-tools': {
		NAME: 'Svelte Language Tools',
		REPOSITORY_NAME: 'sveltejs/language-tools',
	},
};

interface RepoInfo {
	NAME: string;
	REPOSITORY_NAME: string;
	HOMEPAGE?: string;
}
