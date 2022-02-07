import { unfurl } from 'unfurl.js';
import { URL } from 'url';

const get_url_host = (url: string): string => new URL(url).host;

export async function get_title_from_url(url: string): Promise<string> {
	try {
		const data = await unfurl(url, {
			compress: true,
			oembed: false,
			timeout: 3500,
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
