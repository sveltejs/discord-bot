import { build_embed } from '../../utils/embed_helpers.js';
import { get_tutorials } from './_tutorials_cache.js';
import { DEV_MODE } from '../../config.js';
import { command } from 'jellycommands';
import { trgm_search } from 'js-trgm';

export default command({
	name: 'tutorial',
	description: 'Send a link to a svelte tutorial topic.',
	options: [
		{
			type: 'STRING',
			description: 'The name of the tutorial.',
			name: 'topic',
			required: false,
		},
	],
	dev: DEV_MODE,
	global: true,

	run: async ({ interaction }) => {
		const topic = interaction.options.getString('topic');
		try {
			if (!topic) {
				interaction.reply({
					embeds: [
						build_embed({
							description:
								'Have you gone through the [Official Svelte Tutorial](https://svelte.dev/tutorial) yet? It covers all you need to know to start using svelte.',
						}),
					],
				});
				return;
			}

			const cached_tutorials = await get_tutorials();
			let results = trgm_search(topic, Object.keys(cached_tutorials), {
				limit: 1,
			});

			if (results.length === 0) {
				interaction.reply({
					content: `No matching result found. Try again with a different search term.`,
					ephemeral: true,
				});
				return;
			}

			const top_result = results[0];
			interaction.reply({
				embeds: [
					build_embed({
						description: `Have you gone through the tutorial page on [${
							top_result.target
						}](https://svelte.dev/tutorial/${
							cached_tutorials[top_result.target]
						})?`,
					}),
				],
			});
		} catch {
			// Do something or nothing
		}
	},
});
