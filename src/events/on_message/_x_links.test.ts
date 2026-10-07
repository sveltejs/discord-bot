import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MessageFlags, type Message, type MessagePayload } from 'discord.js';
import handle_x_links from './_x_links.ts';

function create_message(content: string) {
	const sent: MessagePayload[] = [];
	const suppressed: boolean[] = [];
	const message = {
		content,
		author: { id: '123' },
		channel: {
			isTextBased: () => true,
			isDMBased: () => false,
			async send(payload: MessagePayload) {
				sent.push(payload);
			},
		},
		async suppressEmbeds(value: boolean) {
			suppressed.push(value);
		},
	};
	return { message, sent, suppressed };
}

describe('X link previews', () => {
	it('suppresses previews when every converted link is hidden', async () => {
		const { message, sent } = create_message(
			'<https://x.com/first/status/1> <https://x.com/second/status/2>',
		);
		await handle_x_links(message as unknown as Message);
		assert.equal(sent[0].options.flags, MessageFlags.SuppressEmbeds);
		assert.deepEqual(sent[0].options.components, []);
		assert.match(
			sent[0].options.content!,
			/<https:\/\/xcancel.com\/first\/status\/1>/,
		);
		assert.match(
			sent[0].options.content!,
			/<https:\/\/xcancel.com\/second\/status\/2>/,
		);
	});

	it('keeps angle-bracketed links hidden without preview buttons', async () => {
		const { message, sent } = create_message(
			'<https://x.com/svelte/status/123>',
		);
		await handle_x_links(message as unknown as Message);
		assert.match(
			sent[0].options.content!,
			/<https:\/\/xcancel.com\/svelte\/status\/123>/,
		);
		assert.equal(sent[0].options.flags, MessageFlags.SuppressEmbeds);
		assert.deepEqual(sent[0].options.components, []);
	});

	it('retains the preview controls for ordinary and parenthesized links', async () => {
		for (const content of [
			'https://x.com/svelte/status/123',
			'(https://x.com/svelte/status/123).',
		]) {
			const { message, sent, suppressed } = create_message(content);
			await handle_x_links(message as unknown as Message);
			assert.match(
				sent[0].options.content!,
				/- https:\/\/xcancel.com\/svelte\/status\/123/,
			);
			assert.equal(sent[0].options.flags, undefined);
			assert.equal(sent[0].options.components?.length, 1);
			assert.deepEqual(suppressed, [true]);
		}
	});

	it('preserves each link preference in a mixed message', async () => {
		const { message, sent } = create_message(
			'<https://x.com/hidden/status/1> https://x.com/visible/status/2',
		);
		await handle_x_links(message as unknown as Message);
		assert.match(
			sent[0].options.content!,
			/- <https:\/\/xcancel.com\/hidden\/status\/1>/,
		);
		assert.match(
			sent[0].options.content!,
			/- https:\/\/xcancel.com\/visible\/status\/2/,
		);
		assert.equal(sent[0].options.flags, undefined);
		assert.equal(sent[0].options.components?.length, 1);
	});

	it('does not send messages without X links or in direct messages', async () => {
		const { message, sent } = create_message('https://example.com');
		await handle_x_links(message as unknown as Message);
		message.content = 'https://x.com/svelte/status/1';
		message.channel.isDMBased = () => true;
		await handle_x_links(message as unknown as Message);
		assert.deepEqual(sent, []);
	});
});
