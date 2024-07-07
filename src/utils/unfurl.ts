import { unfurl } from 'unfurl.js';
import { URL } from 'url';

function get_url_host(raw_url: string) {
	const url = new URL(raw_url);

	if (url.host == 'github.com') {
		const parts = url.pathname.split('/').filter(Boolean);
		if (parts.length < 2) return url.host;

		return `GitHub - ${parts[0]}/${parts[1]}`;
	}

	return url.host;
}

export async function get_title_from_url(url: string): Promise<string> {
	try {
		const data = await unfurl(url, {
			compress: true,
			oembed: false,
			timeout: 2000,
		});

		return (
			data.open_graph?.title ||
			data.twitter_card?.title ||
			data.title ||
			get_url_host(url)
		);
	} catch {
		return get_url_host(url);
	}
}
