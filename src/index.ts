import 'dotenv/config';
import { JellyCommands } from 'jellycommands';
import { Intents } from 'discord.js';

const client = new JellyCommands({
    commands: 'dist/commands',

    clientOptions: {
        intents: [Intents.FLAGS.GUILDS],
    },

    dev: {
        // If we set dev to true in a command it disabled global and adds it to the guilds bellow
        guilds: ['918887934822858802'],
    },

    // we can disable this but I like to see the debug messages xD - GHOST
    debug: true,
});

// Auto reads the DISCORD_TOKEN environment variable
client.login();
