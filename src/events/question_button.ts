import { supabase } from '../db/index';
import { event } from 'jellycommands';
import { wrap_in_embed } from '../utils/embed_helpers';

export default event({
	name: 'interactionCreate',

	async run({ client }, interaction) {
		if (!interaction.isButton()) return;
		if (!interaction.customId.startsWith('prediction')) return;

		await interaction.deferReply({ ephemeral: true });

		const message_id = interaction.customId.slice('prediction_'.length);

		const { data: prediction, error } = await supabase
			.from('predictions')
			.select()
			.eq('message_id', message_id)
			.limit(1)
			.single();

		if (error)
			return void interaction.followUp(
				wrap_in_embed('Unable to find that message prediction'),
			);

		if (interaction.user.id != prediction.author_id)
			return void interaction.followUp(
				wrap_in_embed('You can only report your own predictions'),
			);

		await supabase
			.from('predictions')
			.update({ correct: false })
			.eq('message_id', message_id);

		await interaction.followUp('Thanks for reporting that prediction!');

		const message = await interaction.channel?.messages.fetch(
			interaction.message.id,
		);

		return void message?.edit({
			embeds: wrap_in_embed(
				'Thank for you reporting this prediction as incorrect!',
			).embeds,
			components: [],
		});
	},
});
