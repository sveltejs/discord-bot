import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { trgm_search } from 'js-trgm';
import { DEV_MODE, SVELTE_ORANGE } from '../../config.js';
import { get_tutorials } from './_tutorials_cache.js';

export default command({
	name: 'tutorial',
	description: 'Send a link to a svelte tutorial topic.',
	options: [
		{
			type: ApplicationCommandOptionTypes.STRING,
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
						{
							description:
								'Have you gone through the [Official Svelte Tutorial](https://svelte.dev/tutorial) yet? It covers all you need to know to start using svelte.',
							color: SVELTE_ORANGE,
						},
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
					{
						description: `Have you gone through the tutorial page on [${
							top_result.target
						}](https://svelte.dev/tutorial/${
							cached_tutorials[top_result.target]
						})?`,
						color: SVELTE_ORANGE,
					},
				],
			});
		} catch {
			// Do something or nothing
		}
	},
});
