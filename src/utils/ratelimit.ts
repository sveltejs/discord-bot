interface LimitRecord {
	limit: number;
	channel_ids: Set<string>;
}

export class RateLimitStore {
	private available_uses = new Map<string, LimitRecord>();

	constructor(
		private count: number,
		private time_period: number,
		/** How many unique channels to track */
		private unique_channels: number,
	) {}

	/**
	 * Check whether provide key/user reaches rate limit.
	 *
	 * @param key Reference key in available use store; usually `author.id`
	 * @param channelId Unique channel ID where message was sent and tracked for rate limit.
	 * @param consume If `true`, decrement remaining limit for `key` user.
	 */
	public is_limited(key: string, channelId: string, consume = false) {
		const limit_record = this.available_uses.get(key);

		const available_uses =
			limit_record?.limit ?? this.create_new_bucket(key);
		const channels = limit_record?.channel_ids ?? new Set();

		if (available_uses > 0 && channels.size < this.unique_channels) {
			if (consume) {
				this.available_uses.set(key, {
					limit: available_uses - 1,
					channel_ids: channels.add(channelId),
				});
			}
			return false;
		}
		return true;
	}

	private create_new_bucket(key: string) {
		setTimeout(() => {
			this.available_uses.delete(key);
		}, this.time_period);
		return this.count;
	}
}
