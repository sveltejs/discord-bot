import 'dotenv/config';
import { guildEventsTask } from './scheduled/guild-events';
import { analyticsTask } from './scheduled/analytics';
import { DEV_MODE, TEST_GUILD_ID } from './config';
import { Scheduler } from './scheduled/_scheduler';
import { JellyCommands } from 'jellycommands';
import { IntentsBitField } from 'discord.js';

const client = new JellyCommands({
	components: ['src/commands', 'src/buttons', 'src/events'],

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

new Scheduler(client).addTask(analyticsTask).addTask(guildEventsTask);

// Auto reads the DISCORD_TOKEN environment variable
client.login();
