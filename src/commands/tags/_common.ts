import type { CommandInteraction } from 'discord.js';
import { pb } from '../../db/pocketbase';
import type { ClientResponseError } from 'pocketbase';

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

export type TagCRUDHandler = (options: {
	interaction: CommandInteraction;
	tag_name: string;
	// biome-ignore lint/suspicious/noExplicitAny: easier
	// biome-ignore lint/suspicious/noConfusingVoidType: easier
}) => any | void;
