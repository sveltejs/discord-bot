import { wrap_in_embed } from '../utils/embed_helpers';
import { THREAD_ADMIN_IDS } from '../config';
import { supabase } from '../db/index';
import { event } from 'jellycommands';

export default event({
	name: 'interactionCreate',

	async run({}, interaction) {
		if (!interaction.isButton()) return;
		if (!interaction.customId.startsWith('prediction')) return;

		await interaction.deferReply({ ephemeral: true });

		const message_id = interaction.customId.slice('prediction_'.length);

		if (!THREAD_ADMIN_IDS.includes(interaction.user.id))
			return await interaction.followUp(
				wrap_in_embed(
					'Only ThreadLords are able to report predictions as incorrect',
				),
			);

		const { error } = await supabase
			.from('predictions')
			.update({ correct: false })
			.eq('message_id', message_id);

		if (error)
			return await interaction.followUp(
				wrap_in_embed(
					'There was an error marking that prediction as incorrect',
				),
			);

		await interaction.followUp('Thanks for reporting that prediction!');

		const message = await interaction.channel?.messages.fetch(
			interaction.message.id,
		);

		return await message?.edit({
			embeds: wrap_in_embed(
				'Thank for you reporting this prediction as incorrect!',
			).embeds,
			components: [],
		});
	},
});
