import { DEV_MODE, TEST_GUILD_ID } from '../config';
import { ScheduledTask } from './_scheduler';
import { pb } from '../db/pocketbase';
import {
	GuildScheduledEventEntityType,
	GuildScheduledEventPrivacyLevel,
} from 'discord.js';
import { ClientResponseError } from 'pocketbase';

interface ResponseData {
	__typename: string;
	events: Events;
	__isNode: string;
	id: string;
}

interface Events {
	edges: Edge[];
	pageInfo: PageInfo;
}

interface Edge {
	node: Node;
	cursor: string;
}

interface Node {
	id: string;
	slug: string;
	prettyUrl: string;
	fullUrl: string;
	name: string;
	description: string;
	startAt: string;
	endAt: string;
	timeZone: string;
	visibility: string;
	hasVenue: boolean;
	hasExternalUrl: boolean;
	owner: Owner;
	uploadedSocialCard: any;
	generatedSocialCardURL: string;
	presentations: Presentations;
	venue: Venue;
	createdAt: string;
	updatedAt: string;
}

interface Owner {
	__typename: string;
	id: string;
	name: string;
	__isNode: string;
}

interface Presentations {
	edges: Edge2[];
}

interface Edge2 {
	node: Node2;
	cursor: string;
}

interface Node2 {
	id: string;
	slug: string;
	prettyUrl: string;
	presenter?: Presenter;
	presenterFirstName?: string;
	presenterLastName?: string;
	title: string;
	description: string;
	videoSourceUrl: string;
}

interface Presenter {
	id: string;
	firstName: string;
	lastName: string;
}

interface Venue {
	address: Address;
	id: string;
}

interface Address {
	location: Location;
	id: string;
}

interface Location {
	__typename: string;
	geojson: Geojson;
}

interface Geojson {
	type: string;
	coordinates: number[];
}

interface PageInfo {
	hasPreviousPage: boolean;
	hasNextPage: boolean;
	startCursor: string;
	endCursor: string;
}

// todo doesn't handle pagination

const GUILD_IDS = [
	'svelte-society-london',
	'svelte-society-stockholm',
	'svelte-society-zurich',
	'svelte-society-melbourne',
	'svelte-society-portugal',
	'san-diego-svelte',
	'svelte-society-austria',
	'svelte-society-bangalore',
	'svelte-society-bay-area',
];

function log(...messages: any[]) {
	console.log('[guild-events-sync]', ...messages);
}

export const guildEventsTask: ScheduledTask = {
	interval: 86400,
	name: 'guild-events',
	async handle(client) {
		log('Running');

		const discord_server = await client.guilds.fetch(
			DEV_MODE ? TEST_GUILD_ID : '457912077277855764',
		);

		if (!discord_server) {
			throw new Error('Failed to fetch svelte/testing guild');
		}

		for (const guild_id of GUILD_IDS) {
			log(`Fetching events for ${guild_id}`);

			const response = await fetch(
				`https://guild.host/api/next/${guild_id}/events/upcoming`,
				{
					headers: {
						Accept: 'application/json',
						'User-Agent':
							'Svelte Bot (+https://github.com/sveltejs/discord-bot)',
					},
				},
			);

			const data: ResponseData = await response.json();

			for (const event of data.events.edges) {
				const event_slug = event.node.prettyUrl;

				const exists = await pb
					.collection('guildEventSync')
					.getFirstListItem(
						pb.filter('event_slug = {:event_slug}', { event_slug }),
					)
					.then(() => true)
					.catch((e: ClientResponseError) => {
						if (e.status == 404) return false;
						else throw e;
					});

				if (exists) {
					// prettier-ignore
					log(`  Skipping ${event.node.name} as it already exists`);
					continue;
				}

				log(`  Creating ${event.node.name}`);

				const discordEvent =
					await discord_server.scheduledEvents.create({
						name: event.node.name,
						image: event.node.generatedSocialCardURL.replace(
							/\.svg$/,
							'.png',
						),
						description: event.node.description,
						scheduledStartTime: event.node.startAt,
						scheduledEndTime: event.node.endAt,
						entityType: GuildScheduledEventEntityType.External,
						privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
						entityMetadata: {
							location: event.node.fullUrl,
						},
					});

				await pb.collection('guildEventSync').create({
					event_slug,
					discord_event_id: discordEvent.id,
				});
			}
		}
	},
};
