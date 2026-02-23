import { command } from 'jellycommands';
import { MessageFlags } from 'discord.js';
import { AI_API_URL, AI_SECRET_KEY } from '../config.js';

const MAX_MESSAGE_LENGTH = 2000;

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

		console.log(`[ask] question: "${question}"`);
		console.log(`[ask] posting to ${AI_API_URL}/q`);

		const defer = interaction.deferReply();

		let res: Response;
		try {
			res = await fetch(`${AI_API_URL}/q`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-secret-key': AI_SECRET_KEY ?? '',
				},
				body: JSON.stringify({ question }),
			});
		} catch (err) {
			console.error('[ask] fetch failed:', err);
			await defer;
			await interaction.followUp({ content: 'Could not reach the AI service.' });
			return;
		}

		console.log(`[ask] response status: ${res.status}`);

		await defer;

		if (!res.ok) {
			const body = await res.text();
			console.error(`[ask] error response: ${body}`);
			await interaction.followUp({ content: 'Something went wrong, please try again later.' });
			return;
		}

		const data = (await res.json()) as { text: string; steps: number };
		console.log(`[ask] steps: ${data.steps}, response length: ${data.text.length}`);

		let text = data.text;
		if (text.length > MAX_MESSAGE_LENGTH) {
			text = text.slice(0, MAX_MESSAGE_LENGTH - 3) + '...';
		}

		await interaction.followUp({ content: text, flags: MessageFlags.SuppressEmbeds });
	},
});
