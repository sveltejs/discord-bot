import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import fetch from 'node-fetch';
import { URL } from 'url';
import { DEV_MODE, SVELTE_ORANGE } from '../../config.js';
import { list_embed_builder } from '../../utils/embed_helpers.js';

export default command({
	name: 'mdn',
	description: 'Search the mdn docs',
	global: true,
	dev: DEV_MODE,
	options: [
		{
			name: 'topic',
			description: 'What to search MDN for',
			type: ApplicationCommandOptionTypes.STRING,
			required: false,
		},
	],

	run: async ({ interaction }) => {
		const searchTopic = interaction.options.getString('topic');
		try {
			if (!searchTopic)
				return interaction.reply({
					embeds: [
						{
							color: SVELTE_ORANGE,
							description: `Have a HTML, CSS or JS question? Check the [MDN docs](https://developer.mozilla.org/en-US/docs/Web)`,
						},
					],
				});

			let results = await mdnSearch(searchTopic);

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

async function mdnSearch(
	query: string,
	maxResults: number = 5,
): Promise<null | string[]> {
	const reqUrl = new URL('https://developer.mozilla.org/api/v1/search');
	reqUrl.searchParams.set('q', query);
	reqUrl.searchParams.set('size', maxResults.toString());

	const res = await fetch(reqUrl.toString());

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
