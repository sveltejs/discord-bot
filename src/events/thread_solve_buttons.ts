import { increment_solve_count } from '../utils/threads.js';
import { setTimeout } from 'timers/promises';
import { no_op } from '../utils/promise.js';
import { event } from 'jellycommands';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonComponent,
	ComponentType,
} from 'discord.js';

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
			await interaction
				.reply({
					content: `Couldn't mark <@${solver_id}>`,
					ephemeral: true,
				})
				.catch(no_op);
			return;
		}

		let retries_left = 3;

		while (--retries_left) {
			try {
				const old_buttons_group = interaction.message.components;
				const updated_button_components: ActionRowBuilder<ButtonBuilder>[] =
					[];

				for (const buttons_row of old_buttons_group) {
					if (buttons_row.type != ComponentType.ActionRow) continue;

					const filtered_buttons_row = buttons_row.components.filter(
						(button): button is ButtonComponent =>
							button.type == ComponentType.Button &&
							button.customId !== interaction.customId,
					);

					// Avoid pushing an empty row if there are no buttons left. This prevents the error:
					// "data.components[<empty_row_index>].components[BASE_TYPE_BAD_LENGTH]: Must be between 1 and 5 in length."
					if (!filtered_buttons_row.length) continue;

					const row =
						new ActionRowBuilder<ButtonBuilder>().setComponents(
							filtered_buttons_row.map((button) =>
								ButtonBuilder.from(button),
							),
						);

					updated_button_components.push(row);
				}

				await interaction.update({
					components: updated_button_components.length
						? updated_button_components
						: [],
				});

				return;
			} catch (e) {
				console.error(e);
				await setTimeout(500);
			}
		}
	},
});
