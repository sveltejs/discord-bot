import { command } from 'jellycommands';
import fetch from 'node-fetch';
import { URL } from 'url';
import {
	list_embed_builder,
	wrap_in_embed,
} from '../../utils/embed_helpers.js';

export default command({
	name: 'mdn',
	description: 'Search the mdn docs',
	global: true,

	options: [
		{
			name: 'topic',
			description: 'What to search MDN for',
			type: 'STRING',
			required: false,
		},
	],

	run: async ({ interaction }) => {
		const search_topic = interaction.options.getString('topic');
		try {
			if (!search_topic)
				return interaction.reply(
					wrap_in_embed(
						`Have a HTML, CSS or JS question? Check the [MDN docs](https://developer.mozilla.org/en-US/docs/Web)`,
					),
				);

			const results = await mdn_search(search_topic);

			interaction.reply(
				results
					? {
							embeds: [list_embed_builder(results, 'MDN Docs')],
					  }
					: {
							content:
								'No results found. Try again with a different search term.',
							ephemeral: true,
					  },
			);
		} catch {
			// Do nothing
		}
	},
});

async function mdn_search(
	query: string,
	max_results: number = 5,
): Promise<null | string[]> {
	const req_url = new URL('https://developer.mozilla.org/api/v1/search');
	req_url.searchParams.set('q', query);
	req_url.searchParams.set('size', max_results.toString());

	const res = await fetch(req_url.toString());

	if (res.ok) {
		let results: any = await res.json();
		const count = results.metadata.total.value;

		return count === 0
			? null
			: results.documents.map(doc_to_formatted_link);
	} else {
		return null;
	}
}

function doc_to_formatted_link(doc: {
	title: string;
	mdn_url: string;
}): string {
	return `[${doc.title}](https://developer.mozilla.org${doc.mdn_url})`;
}
