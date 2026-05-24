import { type GuildMember, EmbedBuilder, type EmbedData } from 'discord.js';
import { SVELTE_ORANGE } from '../config.js';
import type { JobPostPayload } from '../webhook/types.js';

export const build_embed = (options: EmbedData) =>
	new EmbedBuilder({ color: SVELTE_ORANGE, ...options });

export function wrap_in_embed(content: string, ephemeral?: boolean) {
	const embed = build_embed({ description: content });
	return { embeds: [embed], ephemeral };
}

export function list_embed_builder(list_items: string[], title?: string) {
	return build_embed({
		description: list_items.join('\n'),
		title,
	});
}

export function tags_embed_builder({
	tag_name,
	tag_content,
	author,
}: {
	tag_name: string;
	tag_content: string;
	author?: GuildMember | null;
}) {
	return [
		build_embed({
			title: `\`${tag_name}\``,
			description: tag_content,
			footer: author
				? {
						text: `Created by ${author.displayName}`,
						iconURL: author.displayAvatarURL({
							size: 64,
						}),
					}
				: undefined,
		}),
	];
}

const JOB_TYPE_LABELS: Record<string, string> = {
	'full-time': 'Full-time',
	'part-time': 'Part-time',
	contract: 'Contract',
	freelance: 'Freelance',
};

export function job_embed_builder(job: JobPostPayload) {
	const fields = [{ name: 'Company', value: job.company, inline: true }];

	if (job.location) {
		fields.push({ name: 'Location', value: job.location, inline: true });
	}

	if (job.type) {
		fields.push({
			name: 'Type',
			value: JOB_TYPE_LABELS[job.type] || job.type,
			inline: true,
		});
	}

	if (job.salary) {
		fields.push({ name: 'Salary', value: job.salary, inline: true });
	}

	return build_embed({
		title: job.title,
		description: job.description,
		url: job.url,
		fields,
		footer: { text: 'Posted via webhook' },
		timestamp: new Date().toISOString(),
	});
}
