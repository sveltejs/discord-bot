import { command } from 'jellycommands';
import { create_breakout } from '../utils/breakout.ts';

export default command({
	name: 'breakout',
	description: 'Continue this discussion in a new thread',
	options: [
		{
			name: 'title',
			description: 'The new thread title',
			type: 'String',
			maxLength: 100,
		},
	],
	global: true,
	dm: false,
	defer: { ephemeral: true },
	run: async ({ interaction }) => {
		await create_breakout(interaction);
	},
});
