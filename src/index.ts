import { createClient } from '@supabase/supabase-js';
import { Intents } from 'discord.js';
import { JellyCommands } from 'jellycommands';
import { DEV_MODE, TEST_GUILD_ID } from './config.js';

const supabase = createClient(
	process.env['SUPABASE_URL']!,
	process.env['SUPABASE_KEY']!,
);

const client = new JellyCommands({
	commands: 'dist/commands',
	events: 'dist/events',

	clientOptions: {
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_MEMBERS,
		],
	},

	dev: {
		global: DEV_MODE,

		// If we set dev to true in a command it disabled global and adds it to the guilds bellow
		guilds: [TEST_GUILD_ID],
	},

	props: {
		supabase,
	},

	// we can disable this but I like to see the debug messages xD - GHOST
	debug: true,

	// This should hopefully fix the issues in production
	cache: DEV_MODE,
});

// Auto reads the DISCORD_TOKEN environment variable
client.login();
