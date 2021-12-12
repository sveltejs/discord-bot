import 'dotenv/config';

export const TEST_GUILD_ID = '918887934822858802';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const SVELTE_ORANGE = 0xff3e00;

export const LINK_ONLY_CHANNELS =
	process.env.MODE === 'DEV'
		? [
				// #test-link-validation
				'918915215368810566',

				// #both-both-is-good
				'919196322303725568',
		  ]
		: [
				// Showcase
				'479653552869081089',

				// Resources
				'837012201444999248',
		  ];

export const AUTO_THREAD_CHANNELS =
	process.env.MODE === 'DEV'
		? [
				// #test-auto-thread
				'918932662226386994',

				// #both-both-is-good
				'919196322303725568',
		  ]
		: [
				// Showcase
				'479653552869081089',

				// Resources
				'837012201444999248',
		  ];
