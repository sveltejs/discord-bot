import { button } from 'jellycommands';
import { MODERATOR_IDS } from '../config';
import { get_member, has_any_role_or_id } from '../utils/snowflake';
import type advise from '../events/on_message/_advise';

/**
 * Handle interaction responses in {@link advise}.
 */
export default button({
	id: /^embed_\w+$/,

	async run({ interaction }) {
		const [, action, author_id] = interaction.customId.split('_') as [
			string,
			'keep' | 'hide',
			string,
		];

		/**
		 * Interacting user is either the author of the original message
		 * or a moderator.
		 */
		const valid_user = has_any_role_or_id(await get_member(interaction), [
			author_id,
			...MODERATOR_IDS,
		]);

		if (!valid_user) {
			await interaction.reply({
				content:
					'Only the original author or a moderator may interact with this post.',
				flags: 'Ephemeral',
			});
			return;
		}

		if (action === 'hide') {
			await interaction.message.suppressEmbeds(true);
		}
		await interaction.update({ components: [] });
	},
});
