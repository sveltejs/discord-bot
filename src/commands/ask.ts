import { command } from 'jellycommands';
import { AI_API_URL, AI_SECRET_KEY } from '../config.js';
import { build_embed } from '../utils/embed_helpers.js';

const MAX_EMBED_LENGTH = 4096;

export default command({
	name: 'ask',
	description: 'Ask an AI-powered question about Svelte',
	global: true,

	options: [
		{
			name: 'question',
			description: 'Your question',
			type: 'String',
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const question = interaction.options.getString('question', true);

		const defer = interaction.deferReply();

		const res = await fetch(`${AI_API_URL}/q`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-secret-key': AI_SECRET_KEY ?? '',
			},
			body: JSON.stringify({ question }),
		});

		await defer;

		if (!res.ok) {
			await interaction.followUp({
				embeds: [build_embed({ description: 'Something went wrong, please try again later.' })],
			});
			return;
		}

		const data = (await res.json()) as { text: string; steps: number };

		let text = data.text;
		if (text.length > MAX_EMBED_LENGTH) {
			text = text.slice(0, MAX_EMBED_LENGTH - 3) + '...';
		}

		await interaction.followUp({
			embeds: [build_embed({ description: text })],
		});
	},
});
