import { URL } from 'node:url';

interface UnfurlResult {
	title: string | null;
	description: string | null;
	url: string | null;
}

export async function get_title_from_url(url: string): Promise<string> {
	try {
		const endpoint = new URL('https://unfurl.willow.rest/v0');
		endpoint.searchParams.set('url', url);

		const response = await fetch(endpoint, {
			headers: {
				'User-Agent':
					'svelte-bot (+https://github.com/sveltejs/discord-bot)',
			},
		});

		const data: UnfurlResult = await response.json();
		return data.title || new URL(url).host;
	} catch {
		return new URL(url).host;
	}
}

console.log(await get_title_from_url('https://willow.sh'));
