import { MessageActionRow, MessageButton } from 'discord.js';
import { build_embed } from '../utils/embed_helpers';
import { NO_QUESTIONS_CHANNELS } from '../config';
import { supabase } from '../db/index';
import { event } from 'jellycommands';
import { guess } from '../ml/guess';

export default event({
	name: 'messageCreate',

	async run({}, message) {
		if (
			!NO_QUESTIONS_CHANNELS.includes(message.channel.id) ||
			message.author.bot ||
			!message.channel.isText() ||
			!message.content.trim().length
		)
			return;

		const prediction = await guess(message.content);
		console.log('prediction', prediction);

		if (prediction.question) {
			const button = new MessageButton()
				.setStyle('SECONDARY')
				.setCustomId(`prediction_${message.id}`)
				.setEmoji('<:far_snape:837108258484781126>');

			const { error } = await supabase.from('predictions').insert({
				message_id: message.id,
				prediction: prediction.chance,
				author_id: message.author.id,
			});

			await message.reply({
				embeds: [
					build_embed({
						description:
							'It looks like you posted a Svelte question!\nPlease make sure to post questions in the <#939867760492703744> or <#939868205869072444> channel',
						footer: {
							text: 'Did I get it wrong? Press the button below to report it',
						},
					}),
				],
				components: [new MessageActionRow({ components: [button] })],
			});
		}
	},
});
