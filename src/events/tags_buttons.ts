import { event } from 'jellycommands';
import { get_tags_list, NO_TAGS_FOUND } from '../utils/tags.js';

const validator = /^tags_page_\d+$/;

export default event({
	name: 'interactionCreate',
	run: async ({}, interaction) => {
		if (!interaction.isButton() || !validator.test(interaction.customId))
			return;

		const page = parseInt(interaction.customId.split('_')[2], 10);

		const res = await get_tags_list(page);

		if (!res) return interaction.reply(NO_TAGS_FOUND);

		interaction.update(res);
	},
});
