import { ActionRowBuilder, ButtonBuilder, ButtonComponent } from 'discord.js';
import { event } from 'jellycommands';
import { setTimeout } from 'timers/promises';
import { no_op } from '../utils/promise.js';
import { increment_solve_count } from '../utils/threads.js';

const validator = /^thread_solver_\d+$/;

export default event({
	name: 'interactionCreate',
	run: async ({}, interaction) => {
		if (!interaction.isButton() || !validator.test(interaction.customId))
			return;

		const solver_id = interaction.customId.split('_')[2];

		try {
			await increment_solve_count(solver_id);
		} catch (e) {
			console.error('DB error in thread_solve_buttons:\n', e);
			interaction.reply(`Couldn't mark <@${solver_id}>`).catch(no_op);
			return;
		}

		let retries_left = 3;

		while (--retries_left) {
			try {
				const updated_buttons = (
					interaction.message.components[0]!
						.components as ButtonComponent[]
				)
					.filter(
						(button) => button.customId !== interaction.customId,
					)
					.map((button) => ButtonBuilder.from(button));

				await interaction.update({
					components: updated_buttons.length
						? [
								new ActionRowBuilder<ButtonBuilder>().setComponents(
									updated_buttons,
								),
						  ]
						: [],
				});
			} catch (e) {
				console.error(e);
				await setTimeout(500);
			}
		}
	},
});
