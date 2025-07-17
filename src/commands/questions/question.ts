import { i_solemnly_swear_it_is_a_forum_thread } from '../../utils/smh_typescript.js';
import { DEV_MODE, SOLVED_TAGS_MAP, HELP_CHANNELS } from '../../config.js';
import { build_embed, wrap_in_embed } from '../../utils/embed_helpers.js';
import { check_autothread_permissions } from '../../utils/threads.js';
import { undefined_on_error } from '../../utils/promise.js';
import { get_member } from '../../utils/snowflake.js';
import { chunk_array } from '../../utils/chunk.js';
import { command } from 'jellycommands';

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type InteractionReplyOptions,
	type Snowflake,
	ThreadAutoArchiveDuration,
	type ThreadChannel,
} from 'discord.js';

export default command({
	name: 'question',
	description: 'Manage a question thread',

	options: [
		{
			name: 'solve',
			description: 'Mark a question as solved',
			type: 'Subcommand',
		},
		{
			name: 'reopen',
			description: 'Reopen a solved question',
			type: 'Subcommand',
		},
	],

	global: true,
	defer: {
		ephemeral: true,
	},

	run: async ({ interaction }) => {
		const subcommand = interaction.options.getSubcommand(true);
		const thread = await interaction.channel?.fetch();

		if (!thread?.isThread() || !HELP_CHANNELS.has(thread.parentId!)) {
			interaction.followUp('This channel is not a question thread');
			return;
		}

		/* @__PURE__ */ i_solemnly_swear_it_is_a_forum_thread(thread);

		const member = await get_member(interaction);
		if (!member) {
			await interaction.followUp('Unable to find you');
			return;
		}

		const has_permission = await check_autothread_permissions(
			thread,
			member,
		);

		if (!has_permission) {
			await interaction.followUp(
				"You don't have the permissions to manage this thread",
			);
			return;
		}

		const solved_tag = SOLVED_TAGS_MAP[thread.parentId!]!;
		switch (subcommand) {
			case 'solve': {
				try {
					if (thread.appliedTags.includes(solved_tag))
						throw new Error('Question already marked as solved');

					await thread.edit({
						autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
						appliedTags: [solved_tag, ...thread.appliedTags],
					});

					await Promise.allSettled([
						get_ending_message(thread, interaction.user.id)
							.then((m) => interaction.followUp(m))
							.catch(console.error),

						thread.send(
							wrap_in_embed(
								'Question marked as solved, thanks everyone!',
							),
						),
					]);
				} catch (e) {
					await interaction.followUp((e as Error).message);
				}
				break;
			}

			case 'reopen': {
				try {
					if (thread.appliedTags.includes(solved_tag)) {
						await thread.edit({
							autoArchiveDuration:
								ThreadAutoArchiveDuration.ThreeDays,
							appliedTags: thread.appliedTags.filter(
								(tag_id) => tag_id !== solved_tag,
							),
						});

						await interaction.followUp('Question reopened.');
					} else {
						await interaction.followUp(
							'This question is already open.',
						);
					}
				} catch (e) {
					await interaction.followUp((e as Error).message);
				}
				break;
			}
		}
	},
});

export async function get_ending_message(
	thread: ThreadChannel,
	initiator_id: Snowflake,
): Promise<InteractionReplyOptions> {
	// Attempt to load all members even if they aren't currently cached
	const thread_members = await thread.members.fetch({ withMember: true });

	const start_message = await undefined_on_error(
		thread.fetchStarterMessage(),
	);

	const clickable_participants = DEV_MODE
		? thread_members
		: thread_members.filter(
				({ guildMember }) =>
					!guildMember.user.bot &&
					guildMember.id !==
						(start_message?.author.id ?? initiator_id),
			);

	const embed = build_embed({
		description: `Thread marked as solved. ${
			clickable_participants.size
				? 'Click the people who helped you solve it. (Optional)'
				: ''
		}`,
	});

	const clickable_participants_group = chunk_array(
		Array.from(clickable_participants.values()),
		5,
	);

	const components: ActionRowBuilder<ButtonBuilder>[] = [];

	for (let i = 0; i < Math.min(clickable_participants_group.length, 5); i++) {
		const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
			clickable_participants_group[i].map(({ guildMember }) =>
				new ButtonBuilder()
					.setCustomId(`thread_solver_${guildMember.id}`)
					.setLabel(guildMember.displayName)
					.setStyle(ButtonStyle.Primary)
					.setDisabled(false),
			),
		);

		components.push(row);
	}

	// Bail on unlikely case of more than 25 helpers
	if (clickable_participants_group.length > 5) {
		embed.setFields([
			{
				name: 'Helper Limit Exceeded!',
				// prettier-ignore
				value: `There are ${clickable_participants.size - 25} additional helpers beyond the limit of 25. If you encounter this issue, please file a GitHub issue [here](https://github.com/sveltejs/discord-bot/issues) to notify our developers. Thank you!`,
			},
		]);
	}

	return clickable_participants_group.length
		? { components, embeds: [embed] }
		: { embeds: [embed] };
}
