import { ChannelType, type Message } from 'discord.js';
import { COMMUNITY_TEXT_CHANNELS } from '../../config';

function debug(args: any | []) {
	if (process.env.NODE_ENV !== 'development') return;

	if (Array.isArray(args)) {
		console.log('slow_mode debug:', ...args);
	} else {
		console.log('slow_mod debug:', args);
	}
}

type QueueItem = { userId: string; timestamp: number };
const messageQueueChannelMap = new Map<string, QueueItem[]>([]);

const ONE_MINUTE = 60_000;
const FIVE_MINUTES = 300_000;
const FIFTEEN_MINUTES = 900_000;
const THIRTY_MINUTES = 1_800_000;

/** Allowed time range for items in message queue */
const QUEUE_TIME_RANGE = FIVE_MINUTES;

/** Number of messages to trigger a thread emoji reaction before next level change. */
const EMOJI_REACTION_MESSAGE_THRESHOLD = 2;

type LevelConfig = {
	level: number;
	triggers: Array<{
		uniqueUsers: number;
		messages: number;
		timeRange: number;
	}>;
	timeout: number;
	rateLimitPerUser: number;
	/* Message to notify channel users. */
	channelMessage: string;
};

const levelConfigs = Object.freeze([
	{
		level: 0,
		triggers: [{ uniqueUsers: 1, messages: 1, timeRange: 0 }],
		timeout: 0,
		rateLimitPerUser: 0,
		channelMessage: '',
	},
	{
		level: 1,
		triggers: [
			{
				uniqueUsers: 1,
				messages: 10,
				timeRange: ONE_MINUTE,
			},
			{
				uniqueUsers: 3,
				messages: 20,
				timeRange: FIVE_MINUTES,
			},
		],
		timeout: FIFTEEN_MINUTES,
		rateLimitPerUser: 15,
		channelMessage:
			'Slow mode set to 15 seconds per message. To evade slow mode, consider opening a thread.',
	},
	{
		level: 2,
		triggers: [
			{
				uniqueUsers: 5,
				messages: 30,
				timeRange: FIVE_MINUTES,
			},
		],
		timeout: THIRTY_MINUTES,
		rateLimitPerUser: 30,
		channelMessage:
			'Slow mode set to 30 seconds per message. To evade slow mode, consider opening a thread.',
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
		debug('return early due to channel mismatch or bot message');
		return;
	}

	const now = Date.now();
	const { channelId } = message;

	if (!Array.isArray(messageQueueChannelMap.get(channelId))) {
		// instantiate array, mapped against channel id
		messageQueueChannelMap.set(channelId, []);
	}

	const channelMessageQueue = messageQueueChannelMap.get(channelId)!;
	debug([
		'queue on message',
		{
			channelMessageQueue,
			messageQueueChannelMap,
		},
	]);

	channelMessageQueue.push({ userId: message.author.id, timestamp: now });

	// Remove old messages from queue
	while (channelMessageQueue[0].timestamp < now - QUEUE_TIME_RANGE) {
		channelMessageQueue.shift();
	}

	debug(['queue on purge', channelMessageQueue]);
	const { level: newLevel, messagesUntilNextLevel } = checkBusyLevel(
		now,
		channelMessageQueue,
	);

	// Return early if:
	//
	// - new level is equal to current level
	// OR
	// - new level is lower or equal to the current level AND current rate limit
	//   hasn't expired
	const currentModeExpired = now > (currentSlowMode?.expiry ?? 0);
	const currentLevel = currentSlowMode?.level ?? -1;
	if (
		newLevel === currentLevel ||
		(newLevel <= currentLevel && !currentModeExpired)
	) {
		debug([
			'early return due to new level not exceeding current, or current rate limit has not expired',
			{
				newLevel,
				currentLevel,
				currentModeExpired,
			},
		]);

		// Add thread emoji reaction to message before next rate limit applies
		if (
			messagesUntilNextLevel >= 0 &&
			messagesUntilNextLevel <= EMOJI_REACTION_MESSAGE_THRESHOLD
		)
			await message.react('🧵');
		return;
	}

	debug([
		'applying config',
		{
			newLevel,
			currentLevel,
			currentModeExpired,
		},
	]);

	const targetConfig = levelConfigs.find((el) => el.level === newLevel);
	if (!targetConfig) {
		debug(['early return', { targetConfig }]);
		return;
	}

	// Set rate limit.
	debug(['setting rate limit', { targetConfig }]);
	await message.channel.setRateLimitPerUser(
		targetConfig.rateLimitPerUser,
		`Configuring ${message.channel} slow mode to ${targetConfig.rateLimitPerUser}.`,
	);

	// Notify channel users of rate limit change.
	if (targetConfig.channelMessage)
		await message.channel.send(targetConfig.channelMessage);

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
	const itemsInRange = queue.filter((item) => {
		return item.timestamp > now - timeRange;
	}).length;

	return itemsInRange;
}

function checkBusyLevel(
	now: number,
	queue: QueueItem[],
): { level: BusyLevels; messagesUntilNextLevel: number } {
	let messagesUntilNextLevel = Infinity;

	// Analyze levels in reverse; from highest to lowest
	for (let i = levelConfigs.length - 1; i > 0; i--) {
		const { triggers, level } = levelConfigs[i];

		// Analyze all triggers
		const triggered = triggers.some((trigger) => {
			const { timeRange, messages, uniqueUsers } = trigger;

			const messagesWithinRange = queueLengthWithinRange(
				timeRange,
				now,
				queue,
			);

			const exceedsMessageThreshold = messagesWithinRange > messages;
			const hasMoreOrEqualUniqueUsers =
				uniqueUsersInQueue(queue) >= uniqueUsers;

			const remainingMessages = messages - messagesWithinRange;
			if (remainingMessages < messagesUntilNextLevel) {
				messagesUntilNextLevel = remainingMessages;
			}

			debug([
				'checking busy level',
				{
					config: levelConfigs[i],
					exceedsMessageThreshold,
					hasMoreOrEqualUniqueUsers,
				},
			]);

			if (exceedsMessageThreshold && hasMoreOrEqualUniqueUsers) {
				return true;
			}

			return false;
		});

		if (triggered) return { level, messagesUntilNextLevel };
	}

	return { level: 0, messagesUntilNextLevel };
}
