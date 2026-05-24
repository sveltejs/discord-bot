import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import type { JellyCommands } from 'jellycommands';
import { api_key_auth } from './middleware/auth.js';
import { create_jobs_router } from './routes/jobs.js';
import { WEBHOOK_PORT, WEBHOOK_API_KEY } from '../config.js';

export function create_webhook_server(client: JellyCommands) {
	const app = new Hono();

	app.use('*', logger());

	app.get('/health', (c) => {
		return c.json({
			status: 'ok',
			discord: client.isReady() ? 'connected' : 'disconnected',
			timestamp: new Date().toISOString(),
		});
	});

	app.use('/webhook/*', api_key_auth);
	app.route('/webhook/jobs', create_jobs_router(client));

	app.notFound((c) => {
		return c.json({ success: false, error: 'Not found' }, 404);
	});

	app.onError((err, c) => {
		console.error('[webhook] Unhandled error:', err);
		return c.json({ success: false, error: 'Internal server error' }, 500);
	});

	return app;
}

export function start_webhook_server(client: JellyCommands) {
	if (!WEBHOOK_API_KEY) {
		console.warn(
			'[webhook] WEBHOOK_API_KEY not set, webhook server disabled',
		);
		return null;
	}

	const app = create_webhook_server(client);

	const server = serve({
		fetch: app.fetch,
		port: WEBHOOK_PORT,
	});

	console.log(`[webhook] Server started on port ${WEBHOOK_PORT}`);
	return server;
}
