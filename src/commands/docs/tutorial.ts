import { command } from 'jellycommands';
import { wrap_in_embed } from '../../utils/embed_helpers.js';
import { search_tutorials } from './_tutorials_cache.js';

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

			const results = await search_tutorials(topic);
			const top_result = results[0];

			if (top_result)
				return interaction.reply(
					wrap_in_embed(
						`Have you gone through the tutorial page on ${top_result}?`,
					),
				);

			interaction.reply({
				content: `No matching result found. Try again with a different search term.`,
				ephemeral: true,
			});
		} catch (error) {
			console.error(`Command: tutorial\n${error}`);
		}
	},
});
