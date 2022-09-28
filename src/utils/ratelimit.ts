export class RateLimitStore {
	private available_uses = new Map<string, number>();

	constructor(private count: number, private time_period: number) {}

	public is_limited(key: string, consume = false) {
		const available_uses =
			this.available_uses.get(key) ?? this.create_new_bucket(key);

		if (available_uses > 0) {
			if (consume) this.available_uses.set(key, available_uses - 1);
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
