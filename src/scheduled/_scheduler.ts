import { JellyCommands } from 'jellycommands';

export interface ScheduledTask {
	name: string;
	interval: number;
	disabled?: boolean;
	handle: (client: JellyCommands) => Promise<void>;
}

export class Scheduler {
	private intervals = new Map<ScheduledTask, NodeJS.Timeout>();
	private tasks: ScheduledTask[] = [];
	private destroyed = false;

	constructor(private readonly client: JellyCommands) {}

	addTask(task: ScheduledTask) {
		if (this.destroyed) throw new Error('scheduler destroyed');
		if (task.disabled) return this;

		const interval = setInterval(() => {
			console.info(
				this.client.isReady()
					? `Running task ${task.name} ${task.interval}`
					: `Skipping task ${task.name} to wait for client`,
			);

			task.handle(this.client).catch((error) => {
				console.error(
					`Task run failed ${task.name} at ${Date.now()}`,
					error,
				);
			});
		}, task.interval * 1000);

		this.tasks.push(task);
		this.intervals.set(task, interval);

		return this;
	}

	destroy() {
		if (this.destroyed) throw new Error('scheduler already destroyed');
		this.destroyed = true;

		for (const interval of this.intervals.values()) {
			clearInterval(interval);
		}

		return null;
	}
}
