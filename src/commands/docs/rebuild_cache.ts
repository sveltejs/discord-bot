import { command } from 'jellycommands';
import { BOT_DEVS } from '../../config';
import { Repos } from '../../utils/repositories';
import { build_cache as build_docs_cache } from './_docs_cache';
import { build_cache as build_tutorials_cache } from './_tutorials_cache';

export default command({
	name: 'rebuildcache',
	description: 'Rebuild the docs and tutorial cache',
	defer: {
		ephemeral: true,
	},
	guards: {
		mode: 'whitelist',
		users: BOT_DEVS,
	},
	run: async ({ interaction }) => {
		return await Promise.all([
			build_docs_cache(Repos.SVELTE),
			build_docs_cache(Repos.SVELTE_KIT),
			build_tutorials_cache(),
		])
			.catch((e) => interaction.followUp(e))
			.then(() => interaction.followUp('Success'));
	},
});
