import { Hono } from 'hono';
import { sValidator } from '@hono/standard-validator';
import type { TextChannel } from 'discord.js';
import type { JellyCommands } from 'jellycommands';
import {
	job_post_schema,
	type WebhookResponse,
	type WebhookErrorResponse,
} from '../types.js';
import { job_embed_builder } from '../../utils/embed_helpers.js';
import { JOBS_CHANNEL_ID } from '../../config.js';

export function create_jobs_router(client: JellyCommands) {
	const router = new Hono();

	router.post('/', sValidator('json', job_post_schema), async (c) => {
		const job = c.req.valid('json');

		if (!client.isReady()) {
			return c.json<WebhookErrorResponse>(
				{ success: false, error: 'Discord client not ready' },
				503,
			);
		}

		let channel: TextChannel;
		try {
			const fetched_channel =
				await client.channels.fetch(JOBS_CHANNEL_ID);
			if (
				!fetched_channel?.isTextBased() ||
				fetched_channel.isDMBased()
			) {
				throw new Error('Invalid channel type');
			}
			channel = fetched_channel as TextChannel;
		} catch (error) {
			console.error('[webhook/jobs] Failed to fetch channel:', error);
			return c.json<WebhookErrorResponse>(
				{ success: false, error: 'Failed to access jobs channel' },
				500,
			);
		}

		try {
			const embed = job_embed_builder(job);
			const message = await channel.send({ embeds: [embed] });

			console.log(
				`[webhook/jobs] Posted job: "${job.title}" at ${job.company}`,
			);

			return c.json<WebhookResponse>(
				{
					success: true,
					message: 'Job posted successfully',
					messageId: message.id,
				},
				201,
			);
		} catch (error) {
			console.error('[webhook/jobs] Failed to send message:', error);
			return c.json<WebhookErrorResponse>(
				{ success: false, error: 'Failed to post message to Discord' },
				500,
			);
		}
	});

	return router;
}
