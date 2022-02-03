import { unfurl } from 'unfurl.js';

export async function get_title_from_url(url: string): Promise<string> {
	try {
		const data = await unfurl(url, {
			compress: true,
			oembed: false,
			timeout: 3500,
		});

		return (
			data.open_graph.title ||
			data.twitter_card.title ||
			data.title ||
			url
		);
	} catch {
		return url;
	}
}
