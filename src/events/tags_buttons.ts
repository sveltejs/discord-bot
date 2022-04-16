import { event } from 'jellycommands';
import { get_tags_list, NO_TAGS_FOUND } from '../utils/tags.js';

const validator = /^tags_page_\d+$/;

export default event({
	name: 'interactionCreate',
	run: async ({}, interaction) => {
		if (!interaction.isButton() || !validator.test(interaction.customId))
			return;

		const page = parseInt(interaction.customId.split('_')[2], 10);

		await get_tags_list(page).then((tags_message) =>
			tags_message
				? interaction.update(tags_message)
				: interaction.reply(NO_TAGS_FOUND),
		);
	},
});
