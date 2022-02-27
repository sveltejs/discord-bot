import { CommandInteraction } from 'discord.js';
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
			return error || !data?.length
				? undefined
				: data.map((t) => `\`${t.tag_name}\``);
		});
}

export type TagCRUDHandler = ({}: {
	interaction: CommandInteraction;
	tag_name: string;
}) => any | void;
