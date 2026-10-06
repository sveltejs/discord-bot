import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ChannelType, type ChatInputCommandInteraction } from 'discord.js';
import { create_breakout } from './breakout.ts';

function fixture(forum = false) {
	const replies: unknown[] = [];
	const source_messages: { content: string }[] = [];
	const new_messages: { content: string }[] = [];
	const creations: Record<string, unknown>[] = [];
	let user_allowed = true;
	let bot_allowed = true;
	const bot = { id: 'bot' };
	const source = {
		id: 'source',
		name: 'Current discussion',
		parentId: 'parent',
		type: ChannelType.PublicThread,
		archived: false,
		locked: false,
		guild: { id: 'guild' },
		appliedTags: ['kept', 'removed'],
		isThread: () => true,
		permissionsFor: (member: unknown) => ({
			has: () => (member === bot ? bot_allowed : user_allowed),
		}),
		send: async (message: { content: string }) => {
			source_messages.push(message);
		},
	};
	const parent = {
		type: forum ? ChannelType.GuildForum : ChannelType.GuildText,
		availableTags: [{ id: 'kept' }],
		permissionsFor: source.permissionsFor,
		threads: {
			create: async (options: Record<string, unknown>) => {
				creations.push(options);
				return {
					id: 'new',
					send: async (message: { content: string }) => {
						new_messages.push(message);
					},
				};
			},
		},
	};
	const interaction = {
		channel: { fetch: async () => source },
		guild: {
			channels: { fetch: async () => parent },
			members: { fetch: async () => ({}), fetchMe: async () => bot },
		},
		user: { id: 'user' },
		options: { getString: () => null as string | null },
		followUp: async (reply: unknown) => {
			replies.push(reply);
		},
	};
	return {
		interaction: interaction as unknown as ChatInputCommandInteraction,
		source,
		parent,
		options: interaction.options,
		replies,
		source_messages,
		new_messages,
		creations,
		deny_user: () => {
			user_allowed = false;
		},
		deny_bot: () => {
			bot_allowed = false;
		},
	};
}

describe('/breakout', () => {
	it('creates a public sibling with a backlink first, then links the original', async () => {
		const data = fixture();
		await create_breakout(data.interaction);
		assert.deepEqual(data.creations, [
			{
				name: 'Breakout: Current discussion',
				type: ChannelType.PublicThread,
			},
		]);
		assert.deepEqual(data.new_messages[0], {
			content:
				'Discussion continued from https://discord.com/channels/guild/source',
			allowedMentions: { parse: [] },
		});
		assert.deepEqual(data.source_messages[0], {
			content: 'Continue this discussion in <#new>',
			allowedMentions: { parse: [] },
		});
		assert.deepEqual(data.replies[0], {
			content: 'Created <#new>',
			allowedMentions: { parse: [] },
		});
	});
	it('creates a forum post with its first message and still-valid source tags', async () => {
		const data = fixture(true);
		data.options.getString = () => 'New topic';
		await create_breakout(data.interaction);
		assert.equal(data.creations[0].name, 'New topic');
		assert.deepEqual(data.creations[0].appliedTags, ['kept']);
		assert.match(
			(data.creations[0].message as { content: string }).content,
			/channels\/guild\/source/,
		);
		assert.equal(data.new_messages.length, 0);
		assert.equal(data.source_messages.length, 1);
	});
	it('rejects private, archived and locked threads without creating anything', async () => {
		for (const change of [
			{ type: ChannelType.PrivateThread },
			{ archived: true },
			{ locked: true },
		]) {
			const data = fixture();
			Object.assign(data.source, change);
			await create_breakout(data.interaction);
			assert.equal(data.creations.length, 0);
			assert.equal(data.replies.length, 1);
		}
	});
	it('rejects non-thread channels and users or bots missing permissions', async () => {
		for (const setup of [
			(data: ReturnType<typeof fixture>) => {
				data.source.isThread = () => false;
			},
			(data: ReturnType<typeof fixture>) => data.deny_user(),
			(data: ReturnType<typeof fixture>) => data.deny_bot(),
		]) {
			const data = fixture();
			setup(data);
			await create_breakout(data.interaction);
			assert.equal(data.creations.length, 0);
			assert.equal(data.replies.length, 1);
		}
	});
	it('caps generated titles and rejects whitespace-only custom titles', async () => {
		const data = fixture();
		data.source.name = 'x'.repeat(100);
		await create_breakout(data.interaction);
		assert.equal(String(data.creations[0].name).length, 100);
		const empty = fixture();
		empty.options.getString = () => '   ';
		await create_breakout(empty.interaction);
		assert.equal(empty.creations.length, 0);
	});
	it('reports partial linking failures without claiming success or making another thread', async () => {
		const data = fixture();
		data.source.send = async () => {
			throw new Error('synthetic failure');
		};
		await create_breakout(data.interaction);
		assert.equal(data.creations.length, 1);
		assert.match(
			(data.replies[0] as { content: string }).content,
			/could not finish linking/,
		);
	});
});
