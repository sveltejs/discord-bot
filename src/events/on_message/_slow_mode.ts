import { ChannelType, type Message } from 'discord.js';
import { COMMUNITY_TEXT_CHANNELS } from 'src/config';

type QueueItem = { userId: string; timestamp: number };
const messageQueueChannelMap = new Map<string, QueueItem[]>([]);

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
};

const levelConfigs = Object.freeze([
	{
		level: 0,
		uniqueUsers: 1,
		messages: 1,
		timeRange: 0,
		timeout: 0,
		rateLimitPerUser: 0,
	},
	{
		level: 1,
		uniqueUsers: 2,
		messages: 6,
		timeRange: ONE_MINUTE,
		timeout: FIFTEEN_MINUTES,
		rateLimitPerUser: 15,
	},
	{
		level: 2,
		uniqueUsers: 3,
		messages: 20,
		timeRange: FIVE_MINUTES,
		timeout: THIRTY_MINUTES,
		rateLimitPerUser: 30,
	},
] as const) satisfies Readonly<LevelConfig[]>;

type BusyLevels = (typeof levelConfigs)[number]['level'];

type SlowModeActivation = {
	level: BusyLevels;
	timestamp: number;
	expiry: number;
};

let currentSlowMode: SlowModeActivation | undefined;

export default async function slow_mode(message: Message): Promise<void> {
	if (
		message.channel.type != ChannelType.GuildText ||
		message.author.bot ||
		!COMMUNITY_TEXT_CHANNELS.includes(message.channelId)
	) {
		return;
	}

	const now = Date.now();
	const { channelId } = message;

	if (!Array.isArray(messageQueueChannelMap.get(channelId))) {
		// instantiate array, mapped against channel id
		messageQueueChannelMap.set(channelId, []);
	}

	const channelMessageQueue = messageQueueChannelMap.get(channelId)!;

	channelMessageQueue.push({ userId: message.author.id, timestamp: now });

	// Remove old messages from queue
	while (channelMessageQueue[0].timestamp < now - QUEUE_TIME_RANGE) {
		channelMessageQueue.shift();
	}

	const newLevel = checkBusyLevel(now, channelMessageQueue);

	// Return early if target level is lower or equal to the current level
	// and current rate limit expired
	const currentModeExpired = now > (currentSlowMode?.expiry ?? 0);
	const currentLevel = currentSlowMode?.level ?? -1;
	if (newLevel <= currentLevel && !currentModeExpired) return;

	const targetConfig = levelConfigs.find((el) => el.level === newLevel);
	if (!targetConfig) return;

	await message.channel.setRateLimitPerUser(
		targetConfig.rateLimitPerUser,
		`Configuring ${message.channel} slow mode to ${targetConfig.rateLimitPerUser}.`,
	);

	const setTime = Date.now();
	currentSlowMode = {
		level: targetConfig.level,
		timestamp: setTime,
		expiry: setTime + targetConfig.timeout,
	};
}

/** Get number of unique users in message queue */
function uniqueUsersInQueue(queue: QueueItem[]) {
	let users = new Set<string>();

	queue.forEach((item) => {
		users.add(item.userId);
	});

	return users.size;
}

/** Number of messages in queue within provided time range */
function queueLengthWithinRange(
	timeRange: number,
	now: number,
	queue: QueueItem[],
) {
	return queue.filter((item) => {
		return item.timestamp < now - timeRange;
	}).length;
}

function checkBusyLevel(now: number, queue: QueueItem[]): BusyLevels {
	// Analyze triggers in reverse; from highest threshold to least
	for (let i = levelConfigs.length - 1; i > 0; i--) {
		const { timeRange, messages, uniqueUsers, level } = levelConfigs[i];

		if (
			queueLengthWithinRange(timeRange, now, queue) > messages &&
			uniqueUsersInQueue(queue) >= uniqueUsers
		) {
			return level;
		}
	}

	return 0;
}
