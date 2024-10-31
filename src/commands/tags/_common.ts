import { CommandInteraction } from 'discord.js';
import { pb } from '../../db/pocketbase';
import { ClientResponseError } from 'pocketbase';

export async function get_tag(name: string) {
	return await pb
		.collection('tags')
		.getFirstListItem(pb.filter('name = {:name}', { name }))
		.catch((e: ClientResponseError) => {
			if (e.status == 404) return null;
			throw e;
		});
}

export async function get_matching_tag_names(name: string) {
	const { items } = await pb.collection('tags').getList(1, 5, {
		filter: pb.filter('name ~ {:name}', { name }),
	});

	return items.map((tag) => tag.name);
}

export type TagCRUDHandler = ({}: {
	interaction: CommandInteraction;
	tag_name: string;
}) => any | void;
