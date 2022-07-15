import { wrap_in_embed } from '../utils/embed_helpers';
import { NO_QUESTIONS_CHANNELS } from '../config';
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
			message.reply(
				wrap_in_embed(
					'It looks like you have posted a question! Please post questions in <#939867760492703744> or <#939868205869072444>. If I was wrong please press the button below.',
				),
			);
		}
	},
});
