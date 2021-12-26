import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import fuzzysort from 'fuzzysort';
import { command } from 'jellycommands';
import fetch from 'node-fetch';
import { DEV_MODE, SVELTE_ORANGE } from '../../config.js';

let tutorialsCache: Record<string, string>;

async function buildTutorialsCache() {
	const res = await fetch('https://api.svelte.dev/docs/svelte/tutorial');
	console.log('Fetching tutorials');
	if (res.ok) {
		const data = await res.json();
		tutorialsCache = {};

		for (let tutSection of data) {
			for (let tutorial of tutSection.tutorials) {
				const title = `${tutSection.name}: ${tutorial.name}`;
				tutorialsCache[title] = tutorial.slug;
			}
		}
	}
}

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
			if (!tutorialsCache) {
				await buildTutorialsCache();
			}
			let results = fuzzysort.go(topic, Object.keys(tutorialsCache), {
				limit: 1,
			});

			if (results.total === 0) {
				interaction.reply({
					content: `No matching result found. Try again with a different search term.`,
					ephemeral: true,
				});
				return;
			}

			const topResult = results[0];
			interaction.reply({
				embeds: [
					{
						description: `Have you gone through the tutorial page on [${
							topResult.target
						}](https://svelte.dev/tutorial/${
							tutorialsCache[topResult.target]
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
