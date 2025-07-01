import { ChannelType, type Message } from 'discord.js';
import { COMMUNITY_TEXT_CHANNELS } from 'src/config';

type QueueItem = { userId: string; timestamp: number };
const messageQueue: QueueItem[] = [];

const ONE_MINUTE = 60_000;
const FIVE_MINUTES = 300_000;
const FIFTEEN_MINUTES = 900_000;
const THIRTY_MINUTES = 1_800_000;

/** Allowed time range for items in message queue */
const QUEUE_TIME_RANGE = FIVE_MINUTES;

type LevelConfig = {
	level: number;
	uniqueUsers: number;
	/** Number of messages to invoke level change. */
	messages: number;
	timeRange: number;
	timeout: number;
	rateLimitPerUser: number;
	/** Log message when setting new rate limit. */
	message: string;
};

const levelConfigs = Object.freeze([
	{
		level: 0,
		uniqueUsers: 1,
		messages: 1,
		timeRange: 0,
		timeout: 0,
		rateLimitPerUser: 0,
		message: '',
	},
	{
		level: 1,
		uniqueUsers: 2,
		messages: 6,
		timeRange: ONE_MINUTE,
		timeout: FIFTEEN_MINUTES,
		rateLimitPerUser: 15,
		message: 'There is some back-and-forth happening.',
	},
	{
		level: 2,
		uniqueUsers: 3,
		messages: 20,
		timeRange: FIVE_MINUTES,
		timeout: THIRTY_MINUTES,
		rateLimitPerUser: 30,
		message:
			'Discussion is getting lively, note that threads do not have slow mode.',
	},
] as const) satisfies Readonly<LevelConfig[]>;

type BusyLevels = (typeof levelConfigs)[number]['level'];

type SlowModeActivation = {
	level: BusyLevels;
	timestamp: number;
	expiry: number;
};

let currentSlowMode: SlowModeActivation = {
	level: 0,
	timestamp: 0,
	expiry: 0,
};

export default async function slow_mode(message: Message): Promise<void> {
	const now = Date.now();

	if (
		message.channel.type != ChannelType.GuildText ||
		message.author.bot ||
		!COMMUNITY_TEXT_CHANNELS.includes(message.channelId)
	) {
		return;
	}

	messageQueue.push({ userId: message.author.id, timestamp: now });

	// Remove old messages from queue
	while (messageQueue[0].timestamp < now - QUEUE_TIME_RANGE) {
		messageQueue.shift();
	}

	const newLevel = checkBusyLevel(now);

	// Return early if target level is lower or equal to the current level
	// and current rate limit expired
	const expired = now > currentSlowMode.expiry;
	if (newLevel <= currentSlowMode.level && !expired) return;

	const targetConfig = levelConfigs.find((el) => el.level === newLevel);
	if (!targetConfig) return;

	await message.channel.setRateLimitPerUser(
		targetConfig.rateLimitPerUser,
		targetConfig.message,
	);

	const setTime = Date.now();
	currentSlowMode = {
		level: targetConfig.level,
		timestamp: setTime,
		expiry: setTime + targetConfig.timeout,
	};
}

/** Get number of unique users in message queue */
function uniqueUsersInQueue() {
	let users = new Set<string>();

	messageQueue.forEach((item) => {
		users.add(item.userId);
	});

	return users.size;
}

/** Number of messages in queue within provided time range */
function queueLengthWithinRange(timeRange: number, now: number) {
	return messageQueue.filter((item) => {
		return item.timestamp < now - timeRange;
	}).length;
}

function checkBusyLevel(now: number): BusyLevels {
	// Analyze triggers in reverse; from highest threshold to least
	for (let i = levelConfigs.length - 1; i > 0; i--) {
		const { timeRange, messages, uniqueUsers, level } = levelConfigs[i];

		if (
			queueLengthWithinRange(timeRange, now) > messages &&
			uniqueUsersInQueue() >= uniqueUsers
		) {
			return level;
		}
	}

	return 0;
}
