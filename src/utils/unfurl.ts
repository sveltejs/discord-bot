import { unfurl } from 'unfurl.js';

export async function getTitleFromUrl(url: string) {
	try {
		const data = await unfurl(url, {
			compress: true,
			oembed: false,
			timeout: 3500,
		});

		return data.open_graph.title || data.twitter_card.title || data.title;
	} catch {
		return url;
	}
}
