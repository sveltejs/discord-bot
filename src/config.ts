export const DEV_MODE = process.env.NODE_ENV !== 'production';

export const TEST_GUILD_ID = process.env.TEST_GUILD_ID ?? '918887934822858802';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const SVELTE_ORANGE = 0xff3e00;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// #region people
const ADMIN_ROLES = [
	// Moderators role in main server
	// '919214972557484073',

	// // Maintainers role
	// '571775211431526410',

	// // Admins role
	// '476141440091815947',

	// Threadlords
	'949258457352114176',
];

// For use in dev server
const TEST_ADMIN_ROLES = ['918888136581476402'];

/**
 * List of roles/user IDs allowed to delete tags even if they're not the author.
 */
export const TAG_DEL_PERMITTED_IDS = DEV_MODE ? TEST_ADMIN_ROLES : ADMIN_ROLES;

/**
 * List of roles/user IDs allowed to create tags.
 */
export const TAG_CREATE_PERMITTED_IDS = DEV_MODE
	? TEST_ADMIN_ROLES
	: ADMIN_ROLES;

export const BOT_DEVS = [
	// cirilla
	'339731096793251854',

	// GHOST
	'282839711834177537',
];
/**
 * List of roles/user IDs other than the creator allowed to modify threads.
 */
export const THREAD_ADMIN_IDS = [
	...BOT_DEVS,
	...(DEV_MODE ? TEST_ADMIN_ROLES : ADMIN_ROLES),
];

// #endregion

export const SOLVED_TAG = DEV_MODE
	? '1023931412933525554'
	: '1024301926952730636';

// #region channels
export const HELP_CHANNELS = DEV_MODE
	? ['1023930215329697792']
	: ['1023340103071965194'];

const COMMUNITY_CHANNELS = [
	// Showcase
	'479653552869081089',

	// Resources
	'837012201444999248',
];

export const LINK_ONLY_CHANNELS = DEV_MODE
	? [
			// #test-link-validation
			'918915215368810566',

			// #both-both-is-good
			'919196322303725568',
	  ]
	: COMMUNITY_CHANNELS;

export const AUTO_THREAD_CHANNELS = DEV_MODE
	? [
			// #test-auto-thread
			'918932662226386994',

			// #both-both-is-good
			'919196322303725568',
	  ]
	: [...COMMUNITY_CHANNELS];
// #endregion
