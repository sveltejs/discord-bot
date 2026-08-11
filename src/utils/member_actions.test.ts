import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { timeout } from './member_actions.ts';

describe('timeout', () => {
	it('times out member', () => {
		const member = {
			timeout: mock.fn(),
		};

		// @ts-expect-error
		timeout(member);
		assert.deepStrictEqual(member.timeout.mock.calls[0].arguments, [
			43_200_000,
			'Bot action',
		]);
	});

	it('times out member with custom reason', () => {
		const member = {
			timeout: mock.fn(),
		};

		// @ts-expect-error
		timeout(member, { reason: 'just because' });
		assert.deepStrictEqual(member.timeout.mock.calls[0].arguments, [
			43_200_000,
			'just because',
		]);
	});
});
