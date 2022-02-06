import 'dotenv/config';

export const DEV_MODE = process.env.NODE_ENV !== 'production';

export const TEST_GUILD_ID = process.env.TEST_GUILD_ID ?? '918887934822858802';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const SVELTE_ORANGE = 0xff3e00;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const LINK_ONLY_CHANNELS = DEV_MODE
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

export const AUTO_THREAD_CHANNELS = DEV_MODE
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

			// svelte-help
			'939867760492703744',
		
			// kit-help
			'939868205869072444'
	  ];
/**
 * List of roles/user IDs allowed to delete tags even if they're not the author.
 */
export const TAG_DEL_PERMITTED_IDS = DEV_MODE
	? [
			// Perms role in test server
			'918888136581476402',
	  ]
	: [
			// Moderators role in main server
			'919214972557484073',

			// Maintainers role
			'571775211431526410',

			// Admins role
			'476141440091815947',
	  ];
/**
 * List of roles/user IDs allowed to create tags.
 */
export const TAG_CREATE_PERMITTED_IDS = DEV_MODE
	? [
			// Perms role in test server
			'918888136581476402',
	  ]
	: [
			// Moderators role in main server
			'919214972557484073',

			// Maintainers role
			'571775211431526410',

			// Admins role
			'476141440091815947',
	  ];
