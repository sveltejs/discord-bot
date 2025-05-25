import { DEV_MODE, TEST_GUILD_ID } from '../config';
import { ScheduledTask } from './_scheduler';
import { pb } from '../db/pocketbase';

export const analyticsTask: ScheduledTask = {
	interval: 60 * 60 * 6,
	name: 'analytics',
	async handle(client) {
		console.log('Saving Analytics');

		const guild = await client.guilds.fetch({
			guild: DEV_MODE ? TEST_GUILD_ID : '457912077277855764',
			withCounts: true,
			force: true,
		});

		if (!guild) {
			throw new Error('Guild not found');
		}

		await pb.collection('analytics').create({
			member_count: guild.approximateMemberCount,
			presence_count: guild.approximatePresenceCount,
		});
	},
};
