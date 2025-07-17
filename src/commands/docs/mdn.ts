import { list_embed_builder } from '../../utils/embed_helpers.js';
import { wrap_in_embed } from '../../utils/embed_helpers.js';
import { command } from 'jellycommands';
import { URL } from 'node:url';

export default command({
	name: 'mdn',
	description: 'Search the mdn docs',
	global: true,

	options: [
		{
			name: 'topic',
			description: 'What to search MDN for',
			type: 'String',
			required: false,
		},
	],

	run: async ({ interaction }) => {
		const search_topic = interaction.options.getString('topic');

		if (!search_topic) {
			await interaction.reply(
				wrap_in_embed(
					'Have a HTML, CSS or JS question? Check the [MDN docs](https://developer.mozilla.org/en-US/docs/Web)',
				),
			);
			return;
		}

		const results = await mdn_search(search_topic);

		await interaction.reply(
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
	},
});

async function mdn_search(
	query: string,
	max_results = 5,
): Promise<null | string[]> {
	const req_url = new URL('https://developer.mozilla.org/api/v1/search');
	req_url.searchParams.set('q', query);
	req_url.searchParams.set('size', max_results.toString());

	const res = await fetch(req_url.toString());

	if (res.ok) {
		// biome-ignore lint/suspicious/noExplicitAny: laziness
		const results: any = await res.json();
		const count = results.metadata.total.value;

		return count === 0
			? null
			: results.documents.map(doc_to_formatted_link);
	}
	return null;
}

function doc_to_formatted_link(doc: {
	title: string;
	mdn_url: string;
}): string {
	return `[${doc.title}](https://developer.mozilla.org${doc.mdn_url})`;
}
