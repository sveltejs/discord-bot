import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonComponent,
	ButtonComponentData,
} from 'discord.js';
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
		const row = new ActionRowBuilder<ButtonBuilder>();

		row.setComponents(
			(message.components[0].components as ButtonComponent[])
				.filter((button) => button.customId !== interaction.customId)
				.map((button) => ButtonBuilder.from(button)),
		);

		await interaction.update(
			// Need to do this because the API gets mad when ActionRow is empty.
			row.components.length ? { components: [row] } : { components: [] },
		);
	},
});
