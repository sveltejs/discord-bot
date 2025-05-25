import { JellyCommands } from 'jellycommands';

export interface ScheduledTask {
	name: string;
	interval: number;
	disabled?: boolean;
	runImmediately?: boolean;
	handle: (client: JellyCommands) => Promise<void>;
}

export class Scheduler {
	private intervals = new Map<ScheduledTask, NodeJS.Timeout>();
	private tasks: ScheduledTask[] = [];
	private destroyed = false;
	private ready: boolean;

	constructor(private readonly client: JellyCommands) {
		this.ready = client.isReady();

		if (!this.ready) {
			// todo check this
			this.client.once('ready', () => {
				this.ready = true;
			});
		}
	}

	private async runTask(task: ScheduledTask) {
		console.info(
			this.client.isReady()
				? `Running task ${task.name} ${task.interval}`
				: `Skipping task ${task.name} to wait for client`,
		);

		try {
			await task.handle(this.client);
		} catch (error) {
			console.error(
				`Task run failed ${task.name} at ${Date.now()}`,
				error,
			);
		}
	}

	addTask(task: ScheduledTask) {
		if (this.destroyed) throw new Error('scheduler destroyed');
		if (task.disabled) return this;

		const register = async () => {
			this.client.log.debug(`[scheduler] Registering task ${task.name}`);

			if (task.runImmediately) {
				this.client.log.debug(
					`[scheduler] Honoring runImmediately for ${task.name}`,
				);

				await this.runTask(task);
			}

			const interval = setInterval(
				() => this.runTask(task),
				task.interval * 1000,
			);

			this.tasks.push(task);
			this.intervals.set(task, interval);
		};

		if (this.client.isReady()) {
			register();
		} else {
			this.client.once('ready', () => {
				register();
			});
		}

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
