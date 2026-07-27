import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert';
import { RateLimitStore } from './ratelimit.ts';

describe('RateLimitStore', () => {
	afterEach(() => {
		RateLimitStore.clear_timers();
	});

	it('detects single channel spam', () => {
		// 3 messages within a 5 second period
		const single_channel_limit = new RateLimitStore(3, 5_000, 1);
		single_channel_limit.is_limited('abc', 'one');
		single_channel_limit.is_limited('abc', 'one');
		single_channel_limit.is_limited('abc', 'one');

		assert.strictEqual(single_channel_limit.is_limited('abc', 'one'), true);
	});

	it('detects multi channel spam', () => {
		// 3 messages across 3 channels within a 10 second period
		const multi_channel_limit = new RateLimitStore(3, 10_000, 3);
		multi_channel_limit.is_limited('abc', 'one');
		multi_channel_limit.is_limited('abc', 'two');
		multi_channel_limit.is_limited('abc', 'three');

		assert.strictEqual(multi_channel_limit.is_limited('abc', 'four'), true);
	});

	it('does not interpret single channel spam as multi channel spam', () => {
		// 3 messages across 3 channels within a 10 second period
		const multi_channel_limit = new RateLimitStore(3, 10_000, 3);
		multi_channel_limit.is_limited('abc', 'one');
		multi_channel_limit.is_limited('abc', 'one');
		multi_channel_limit.is_limited('abc', 'one');

		assert.strictEqual(multi_channel_limit.is_limited('abc', 'one'), false);
	});
});
