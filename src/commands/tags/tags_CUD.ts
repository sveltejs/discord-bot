import type { SupabaseClient } from '@supabase/supabase-js';
import type { Message } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import { DEV_MODE } from '../../config';
import { tagsEmbedBuilder } from '../../utils/embedBuilder';
import type { Tag } from './tags_read';

const enum Actions {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
}

export default command({
	name: 'tags',
	description: 'Create, edit or delete tags',
	global: true,
	dev: DEV_MODE,
	options: [
		{
			name: Actions.CREATE,
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			description: 'Create a tag',
			options: [
				{
					name: 'name',
					description: 'The name of the tag to create',
					type: ApplicationCommandOptionTypes.STRING,
					required: true,
				},
			],
		},
		{
			name: Actions.UPDATE,
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			description: 'Update a tag',
			options: [
				{
					name: 'name',
					description: 'The exact name of the tag to edit',
					type: ApplicationCommandOptionTypes.STRING,
					required: true,
				},
			],
		},
		{
			name: Actions.DELETE,
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			description: 'Delete a tag',
			options: [
				{
					name: 'name',
					description: 'The exact name of the tag to delete',
					type: ApplicationCommandOptionTypes.STRING,
					required: true,
				},
			],
		},
	],

	run: async ({ interaction, client }) => {
		const subcommand = interaction.options.getSubcommand() as Actions;
		const tagName = interaction.options
			.getString('name', true)
			.toLowerCase();
		const supabase: SupabaseClient = client.props.get('supabase');

		const { data: tags, error } = await supabase
			.from<Tag>('tags')
			.select('*')
			.eq('tag_name', tagName)
			.limit(1);
		if (error) return;
		const tag = tags?.[0];

		switch (subcommand) {
			case Actions.CREATE: {
				if (tag) {
					await interaction.reply({
						content:
							'A tag with that name exists already. Did you mean to do `/tags update` instead?',
						ephemeral: true,
					});
				}

				await interaction.reply({
					content:
						'Send the contents for the tag in this channel within the next 60 seconds.',
					ephemeral: true,
				});

				let messageColl = await interaction.channel?.awaitMessages({
					time: 60_000,
					filter: (message: Message) =>
						message.author === interaction.user,
					max: 1,
				});

				const message = messageColl?.first();
				if (!message) {
					await interaction.editReply({
						content: 'No content received for the tag. Aborting.',
					});
					return;
				}
				await message.delete();
				// All messages from the bot are ephemeral so feels kinda weird to have the message stick around

				const { error } = await supabase.from<Tag>('tags').insert({
					tag_name: tagName,
					tag_content: message.content,
					author_id: interaction.user.id,
				});
				if (error) {
					await interaction.editReply({
						content: `There was an error in creating the tag "${tagName}". Tag names are case insensitive and should be unique.`,
					});
					return;
				}
				await interaction.editReply({
					content: `Added tag "${tagName}".`,
					embeds: [
						tagsEmbedBuilder({
							tagName,
							tagContent: message.content,
							author: interaction.user,
						}),
					],
				});

				break;
			}

			case Actions.DELETE: {
				if (!tag) {
					await interaction.reply({
						content: 'No tag with that name exists.',
						ephemeral: true,
					});
					return;
				}
				if (
					interaction.user.id !==
					tag.author_id /*TODO: add moderator check*/
				) {
					await interaction.reply({
						content:
							"You don't have the permissions to delete that tag. You either have to be the author or a moderator.",
						ephemeral: true,
					});
					return;
				}

				const { error } = await supabase
					.from<Tag>('tags')
					.delete()
					.eq('id', tag.id);
				if (error) {
					await interaction.reply({
						content: `Failed to delete tag "${tagName}".`,
						ephemeral: true,
					});
					return;
				}
				await interaction.reply({
					content: `Tag "${tagName}" was successfully deleted.`,
					embeds: [
						tagsEmbedBuilder({
							tagName,
							tagContent: tag.tag_content,
							author: client.users.cache.get(tag.author_id),
						}),
					],
					ephemeral: true,
				});
				break;
			}

			case Actions.UPDATE: {
				if (!tag) {
					await interaction.reply({
						content:
							'No tag with that name exists. Did you mean to do `/tags create` instead?',
						ephemeral: true,
					});
					return;
				}
				if (interaction.user.id !== tag.author_id) {
					await interaction.reply({
						content:
							"You don't have the permissions to delete that tag. You have to be the author of the tag.",
						ephemeral: true,
					});
					return;
				}

				await interaction.reply({
					content: `Editing tag "${tagName}". Send the new contents for the tag in this channel within the next 60 seconds.`,
					ephemeral: true,
					embeds: [
						tagsEmbedBuilder({
							tagName,
							tagContent: tag.tag_content,
							author: client.users.cache.get(tag.author_id),
						}),
					],
				});

				let messageColl = await interaction.channel?.awaitMessages({
					time: 60_000,
					filter: (message: Message) =>
						message.author === interaction.user,
					max: 1,
				});

				const message = messageColl?.first();
				if (!message) {
					await interaction.editReply({
						content: 'No content received for the tag. Aborting.',
					});
					return;
				}
				await message.delete();

				const { error } = await supabase
					.from<Tag>('tags')
					.update({ tag_content: message.content })
					.eq('id', tag.id);

				if (error) {
					await interaction.editReply({
						content: `Failed to update tag "${tagName}."`,
					});
					return;
				}
				await interaction.editReply({
					content: `Tag "${tagName}" was successfully updated.`,
					embeds: [
						tagsEmbedBuilder({
							tagName,
							tagContent: message.content,
							author: client.users.cache.get(tag.author_id),
						}),
					],
				});
				break;
			}
		}
	},
});
