import { command } from 'jellycommands';
import fetch from 'node-fetch';
import { URL } from 'url';
import { build_embed, list_embed_builder } from '../../utils/embed_helpers.js';

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
				return interaction.reply({
					embeds: [
						build_embed({
							description: `Have a HTML, CSS or JS question? Check the [MDN docs](https://developer.mozilla.org/en-US/docs/Web)`,
						}),
					],
				});

			let results = await mdn_search(search_topic);

			if (results)
				return interaction.reply({
					embeds: [list_embed_builder(results, 'MDN Docs')],
				});

			await interaction.reply({
				content:
					'No results found. Try again with a different search term.',
				ephemeral: true,
			});
		} catch {
			// Do nothing
		}
	},
});

async function mdn_search(
	query: string,
	maxResults: number = 5,
): Promise<null | string[]> {
	const req_url = new URL('https://developer.mozilla.org/api/v1/search');
	req_url.searchParams.set('q', query);
	req_url.searchParams.set('size', maxResults.toString());

	const res = await fetch(req_url.toString());

	if (res.ok) {
		let results: any = await res.json();
		const count = results.metadata.total.value;

		return count === 0
			? null
			: results.documents.map(
					(doc: Record<string, string>) =>
						`[${doc.title}](https://developer.mozilla.org${doc.mdn_url})`,
			  );
	} else {
		return null;
	}
}
