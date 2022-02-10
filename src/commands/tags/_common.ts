import { CommandInteraction, Snowflake } from 'discord.js';
import { supabase } from '../../db/index.js';

export interface Tag {
	id: number;
	tag_name: string;
	tag_content: string;
	author_id: string;
}

export async function get_tag(tag_name: string) {
	return supabase
		.from<Tag>('tags')
		.select('*')
		.eq('tag_name', tag_name)
		.limit(1)
		.maybeSingle()
		.then(({ data }) => data);
}

export async function get_matching_tag_names(tag_name: string) {
	return supabase
		.rpc<Tag>('matching_tags', {
			to_search: tag_name,
		})
		.then(({ data, error }) => {
			return error || !data?.length ? null : data.map((t) => t.tag_name);
		});
}

/**
 * Get the member having the `id` in the guild where the interaction was created.
 *
 * @todo this could be reused elsewhere so should be moved to utils
 * but I can't think of a filename
 */
export async function get_member(
	interaction: CommandInteraction,
	id: Snowflake,
) {
	return interaction.guild?.members.fetch(id);
}

export type TagCUDHandler = ({
	interaction,
	tag_name,
}: {
	interaction: CommandInteraction;
	tag_name: string;
}) => any | void;
