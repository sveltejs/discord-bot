import type { SupabaseClient } from '@supabase/supabase-js';
import { SVELTE_ORANGE } from '../config.js';
import { command } from 'jellycommands';

export default command({
	name: 'test2',
	description: "Testing again because bot doesn't wanna work",

	global: true,
	dev: true,

	run: ({ interaction, client }) => {
		interaction.reply({
			embeds: [{ description: 'ok', color: SVELTE_ORANGE }],
		});
	},
});
