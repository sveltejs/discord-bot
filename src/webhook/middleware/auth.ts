import { timingSafeEqual } from 'node:crypto';
import type { MiddlewareHandler } from 'hono';
import { WEBHOOK_API_KEY } from '../../config.js';

export const api_key_auth: MiddlewareHandler = async (c, next) => {
	const api_key = c.req.header('X-API-Key');

	if (!WEBHOOK_API_KEY) {
		console.error('[webhook] WEBHOOK_API_KEY not configured');
		return c.json({ success: false, error: 'Server misconfigured' }, 500);
	}

	if (!api_key) {
		return c.json(
			{ success: false, error: 'Missing X-API-Key header' },
			401,
		);
	}

	const key_matches =
		api_key.length === WEBHOOK_API_KEY.length &&
		timingSafeEqual(Buffer.from(api_key), Buffer.from(WEBHOOK_API_KEY));

	if (!key_matches) {
		return c.json({ success: false, error: 'Invalid API key' }, 403);
	}

	return next();
};
