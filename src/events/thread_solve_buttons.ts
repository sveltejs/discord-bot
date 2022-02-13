import { event } from 'jellycommands';
import { increment_solve_count } from '../utils/threads.js';

const validator = /^thread_solver_\d+$/;

export default event({
	name: 'interactionCreate',
	run: async ({}, interaction) => {
		if (!interaction.isButton() || !validator.test(interaction.customId))
			return;

		const solver_id = interaction.customId.split('_')[2];
		await increment_solve_count(solver_id);
		const message = await interaction.channel?.messages.fetch(
			interaction.message.id,
		);

		if (!message) return;
		const row = message.components[0];

		row.setComponents(
			row.components.filter((c) => c.customId !== interaction.customId),
		);

		interaction.update(
			// Need to do this because the API gets mad when ActionRow is empty.
			row.components.length ? { components: [row] } : { components: [] },
		);
	},
});
