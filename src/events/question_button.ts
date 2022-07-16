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

		const { error } = await supabase
			.from('predictions')
			.select()
			.eq('message_id', message_id)
			.limit(1)
			.single();

		if (error)
			return void (await interaction.followUp(
				wrap_in_embed('Unable to find that message prediction'),
			));

		if (!THREAD_ADMIN_IDS.includes(interaction.user.id))
			return void (await interaction.followUp(
				wrap_in_embed(
					'Only ThreadLords are able to report predictions as incorrect',
				),
			));

		await supabase
			.from('predictions')
			.update({ correct: false })
			.eq('message_id', message_id);

		await interaction.followUp('Thanks for reporting that prediction!');

		const message = await interaction.channel?.messages.fetch(
			interaction.message.id,
		);

		return void (await message?.edit({
			embeds: wrap_in_embed(
				'Thank for you reporting this prediction as incorrect!',
			).embeds,
			components: [],
		}));
	},
});
