import 'dotenv/config';

export const DEV_MODE = process.env.NODE_ENV !== 'production';

export const TEST_GUILD_ID = process.env.TEST_GUILD_ID ?? '918887934822858802';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const SVELTE_ORANGE = 0xff3e00;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const SVELTE_COIN_EMOJI = DEV_MODE
	? '<:sveltecoin:942620393359966229>'
	: '<:sveltecoin:942765779038920785>';

// #region people
const ADMIN_ROLES = [
	// Moderators role in main server
	'919214972557484073',

	// Maintainers role
	'571775211431526410',

	// Admins role
	'476141440091815947',
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

/**
 * List of roles/user IDs other than the creator allowed to modify threads.
 */
export const THREAD_ADMIN_IDS = [
	// cirilla
	'339731096793251854',

	// GHOST
	'282839711834177537',

	...(DEV_MODE ? TEST_ADMIN_ROLES : ADMIN_ROLES),
];

// #endregion

// #region channels
export const HELP_CHANNELS = DEV_MODE
	? ['935524190008770610']
	: [
			// svelte-help
			'939867760492703744',

			// kit-help
			'939868205869072444',
	  ];

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

			// emulated help channel
			'935524190008770610',
	  ]
	: [...COMMUNITY_CHANNELS, ...HELP_CHANNELS];
// #endregion
