import { get_tags_list, NO_TAGS_FOUND } from '../utils/tags.js';
import { button } from 'jellycommands';

export default button({
	id: /^tags_page_\d+$/,

	async run({ interaction }) {
		console.log('asd');
		const page = parseInt(interaction.customId.split('_')[2], 10);

		const response = await get_tags_list(page);

		if (response) {
			interaction.update(response);
		} else {
			interaction.reply(NO_TAGS_FOUND);
		}
	},
});
