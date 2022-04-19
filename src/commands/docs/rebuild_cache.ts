import { command } from 'jellycommands';
import { BOT_DEVS } from '../../config';
import { Repos } from '../../utils/repositories';
import { get_member, has_any_role_or_id } from '../../utils/snowflake';
import { build_cache as build_docs_cache } from './_docs_cache';
import { build_cache as build_tutorials_cache } from './_tutorials_cache';

export default command({
	name: 'rebuildcache',
	description: 'Rebuild the docs and tutorial cache',
	defer: {
		ephemeral: true,
	},
	global: true,
	run: async ({ interaction }) => {
		const member = await get_member(interaction);

		if (has_any_role_or_id(member, BOT_DEVS))
			await Promise.all([
				build_docs_cache(Repos.SVELTE),
				build_docs_cache(Repos.SVELTE_KIT),
				build_tutorials_cache(),
			])
				.catch((e) => interaction.followUp(e))
				.then(() => interaction.followUp('Success'));
	},
});
