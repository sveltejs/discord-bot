import { createDocsClient, type BlockGroup } from './svelte-docs';
import { command } from 'jellycommands';
import dedent from 'dedent';
import {
	ButtonStyle,
	ComponentType,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	userMention,
} from 'discord.js';

const docs = await createDocsClient();

function max(content: string[], limit: number) {
	let currentLength = 0;

	for (let i = 0; i < content.length; i++) {
		currentLength += content[i].length;
		if (currentLength > limit) {
			return content.slice(0, i);
		}
	}

	return content;
}

// Based on https://github.com/sveltejs/svelte.dev/blob/a61f12f5097b44c4523f1094a9ed8ec7d6027a81/packages/site-kit/src/lib/search/SearchResultList.svelte#L16-L34
function excerpt(content: string, query: string) {
	const index = content.toLowerCase().indexOf(query.toLowerCase());
	if (index === -1) return content.slice(0, 80);

	const prefix =
		index > 25 && content.length > 50
			? content.slice(index - 20, index)
			: content.slice(0, index);

	const suffix = content.slice(
		index + query.length,
		index + query.length + (80 - (prefix.length + query.length)),
	);

	return `${prefix}${content.slice(index, index + query.length)}${suffix}`;
}

function stringifySearchResult(
	result: BlockGroup,
	query: string,
	maxLength = 500,
) {
	// prettier-ignore
	const blocks = result.blocks.map((block) => dedent`
        [${block.breadcrumbs.slice(2).join(' • ')}](https://svelte.dev${block.href})
        ${excerpt(block.content, query)
            .replaceAll('\n', '')
            .replaceAll(query, `**${query}**`)
            .trim()}
    `);

	return dedent`
        ## ${result.breadcrumbs.join(' • ')}

        ${max(blocks, maxLength).join('\n\n')}
    `;
}

export default command({
	name: 'docs',
	description: 'Search the Svelte docs',
	global: true,

	options: [
		{
			type: 'String',
			name: 'query',
			description: 'The search query',
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const query = interaction.options.getString('query', true);
		const results = docs.search(query);

		if (!results.length) {
			await interaction.reply({
				flags: MessageFlags.Ephemeral,
				content: 'No results found',
			});
			return;
		}

		const buttonPrefix = crypto.randomUUID();
		const components = [];

		for (let i = 0; i < results.length; i++) {
			const str = stringifySearchResult(results[i], query);
			const section = new SectionBuilder()
				.addTextDisplayComponents((text) => text.setContent(str))
				.setButtonAccessory((button) =>
					button
						.setCustomId(`${buttonPrefix}-${i}`)
						.setLabel('Send in Chat')
						.setStyle(ButtonStyle.Secondary),
				);

			components.push(section);

			if (results.length > i + 1) {
				components.push(
					new SeparatorBuilder()
						.setDivider(true)
						.setSpacing(SeparatorSpacingSize.Large),
				);
			}
		}

		const response = await interaction.reply({
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			withResponse: true,
			components: components.slice(0, 18),
		});

		const button = await response.resource?.message?.awaitMessageComponent({
			filter: (i) => i.user.id == interaction.user.id,
			time: 60_000 * 10,
		});

		if (button) {
			const resultIndex = Number.parseInt(
				button.customId.slice(buttonPrefix.length + 1),
			);

			await button.reply({
				flags: MessageFlags.IsComponentsV2,
				components: [
					new TextDisplayBuilder().setContent(
						stringifySearchResult(
							results[resultIndex],
							query,
							1200,
						),
					),
					new SeparatorBuilder()
						.setDivider(true)
						.setSpacing(SeparatorSpacingSize.Large),
					new TextDisplayBuilder().setContent(
						`</${interaction.commandName}:${interaction.commandId}> query: \`${query}\` | Search by ${userMention(interaction.user.id)}`,
					),
				],
			});

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				components: button.message.components.flatMap((component) =>
					component.type === ComponentType.Section
						? component.components
						: component,
				),
			});
		}
	},
});
