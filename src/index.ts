import 'dotenv/config';
import { DEV_MODE, TEST_GUILD_ID } from './config.js';
import { JellyCommands } from 'jellycommands';
import { IntentsBitField } from 'discord.js';

const client = new JellyCommands({
	commands: 'src/commands',
	buttons: 'src/buttons',
	events: 'src/events',

	clientOptions: {
		intents: [
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.MessageContent,
		],
	},

	dev: {
		global: DEV_MODE,

		// If we set dev to true in a command it disabled global and adds it to the guilds bellow
		guilds: [TEST_GUILD_ID],
	},

	// we can disable this but I like to see the debug messages xD - GHOST
	debug: true,

	// This should hopefully fix the issues in production
	cache: DEV_MODE,
});

// Auto reads the DISCORD_TOKEN environment variable
client.login();
