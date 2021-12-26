import { createClient } from '@supabase/supabase-js';
import { JellyCommands } from 'jellycommands';
import { TEST_GUILD_ID } from './config.js';
import { Intents } from 'discord.js';

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
		// If we set dev to true in a command it disabled global and adds it to the guilds bellow
		guilds: [TEST_GUILD_ID],
	},

	props: {
		supabase,
	},

	// we can disable this but I like to see the debug messages xD - GHOST
	debug: true,
});

// Auto reads the DISCORD_TOKEN environment variable
client.login();
