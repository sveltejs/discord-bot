import { command } from 'jellycommands';
import { trgm_search } from 'js-trgm';
import { wrap_in_embed } from '../../utils/embed_helpers.js';
import { get_tutorials } from './_tutorials_cache.js';

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
	global: true,

	run: async ({ interaction }) => {
		const topic = interaction.options.getString('topic');
		try {
			if (!topic) {
				return interaction.reply(
					wrap_in_embed(
						'Have you gone through the [Official Svelte Tutorial](https://svelte.dev/tutorial) yet? It covers all you need to know to start using svelte.',
					),
				);
			}

			const cached_tutorials = await get_tutorials();
			let results = trgm_search(topic, Object.keys(cached_tutorials), {
				limit: 1,
			});

			const top_result = results?.[0];
			if (!top_result) {
				return interaction.reply({
					content: `No matching result found. Try again with a different search term.`,
					ephemeral: true,
				});
			}

			interaction.reply(
				wrap_in_embed(
					// prettier-ignore
					`Have you gone through the tutorial page on [${top_result.target}](https://svelte.dev/tutorial/${cached_tutorials[top_result.target]})?`,
				),
			);
		} catch {
			// Do something or nothing
		}
	},
});
