import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { command } from 'jellycommands';
import fuzzysort from 'fuzzysort';
import { DEV_MODE, SVELTE_ORANGE } from '../../config';

// Might be a better idea to read this from a JSON file created in a build script
// instead of hardcoding it, but for now
const tutorials: Record<string, string> = {
	Basics: 'basics',
	'Adding data': 'adding-data',
	'Dynamic attributes': 'dynamic-attributes',
	Styling: 'styling',
	'Nested components': 'nested-components',
	'HTML tags': 'html-tags',
	'Making an app': 'making-an-app',
	Assignments: 'reactive-assignments',
	Declarations: 'reactive-declarations',
	Statements: 'reactive-statements',
	'Updating arrays and objects': 'updating-arrays-and-objects',
	'Declaring props': 'declaring-props',
	'Default values': 'default-values',
	'Spread props': 'spread-props',
	'If blocks': 'if-blocks',
	'Else blocks': 'else-blocks',
	'Else-if blocks': 'else-if-blocks',
	'Each blocks': 'each-blocks',
	'Keyed each blocks': 'keyed-each-blocks',
	'Await blocks': 'await-blocks',
	'DOM events': 'dom-events',
	'Inline handlers': 'inline-handlers',
	'Event modifiers': 'event-modifiers',
	'Component events': 'component-events',
	'Event forwarding': 'event-forwarding',
	'DOM event forwarding': 'dom-event-forwarding',
	'Text inputs': 'text-inputs',
	'Numeric inputs': 'numeric-inputs',
	'Checkbox inputs': 'checkbox-inputs',
	'Group inputs': 'group-inputs',
	'Textarea inputs': 'textarea-inputs',
	'Select bindings': 'select-bindings',
	'Select multiple': 'multiple-select-bindings',
	'Contenteditable bindings': 'contenteditable-bindings',
	'Each block bindings': 'each-block-bindings',
	'Media elements': 'media-elements',
	Dimensions: 'dimensions',
	This: 'bind-this',
	'Component bindings': 'component-bindings',
	'Binding to component instances': 'component-this',
	onMount: 'onmount',
	onDestroy: 'ondestroy',
	'beforeUpdate and afterUpdate': 'update',
	tick: 'tick',
	'Writable stores': 'writable-stores',
	'Auto-subscriptions': 'auto-subscriptions',
	'Readable stores': 'readable-stores',
	'Derived stores': 'derived-stores',
	'Custom stores': 'custom-stores',
	'Store bindings': 'store-bindings',
	Tweened: 'tweened',
	Spring: 'spring',
	'The transition directive': 'transition',
	'Adding parameters': 'adding-parameters-to-actions',
	'In and out': 'in-and-out',
	'Custom CSS transitions': 'custom-css-transitions',
	'Custom JS transitions': 'custom-js-transitions',
	'Transition events': 'transition-events',
	'Local transitions': 'local-transitions',
	'Deferred transitions': 'deferred-transitions',
	'Key blocks': 'key-blocks',
	'The animate directive': 'animate',
	'The use directive': 'actions',
	'The class directive': 'classes',
	'Shorthand class directive': 'class-shorthand',
	Slots: 'slots',
	'Slot fallbacks': 'slot-fallbacks',
	'Named slots': 'named-slots',
	'Checking for slot content': 'optional-slots',
	'Slot props': 'slot-props',
	'setContext and getContext': 'context-api',
	'<svelte:self>': 'svelte-self',
	'<svelte:component>': 'svelte-component',
	'<svelte:window>': 'svelte-window',
	'<svelte:window> bindings': 'svelte-window-bindings',
	'<svelte:body>': 'svelte-body',
	'<svelte:head>': 'svelte-head',
	'<svelte:options>': 'svelte-options',
	'<svelte:fragment>': 'svelte-fragment',
	'Sharing code': 'sharing-code',
	Exports: 'module-exports',
	'The @debug tag': 'debug',
	'Congratulations!': 'congratulations',
};

const preppedTutorialTitles = Object.keys(tutorials).map((title) =>
	fuzzysort.prepare(title),
);

export default command({
	name: 'tutorial',
	description: 'Send a link to a svelte tutorial topic.',
	options: [
		{
			type: ApplicationCommandOptionTypes.STRING,
			description: 'The name of the tutorial.',
			name: 'topic',
			required: false,
		},
	],
	dev: DEV_MODE,
	global: true,

	run: ({ interaction }) => {
		const topic = interaction.options.getString('topic');
		if (!topic) {
			interaction.reply({
				embeds: [
					{
						description: `Have you gone through the [Official Svelte Tutorial](https://svelte.dev/tutorial) yet?\n\
						It covers all you need to know to start using svelte.`,
						color: SVELTE_ORANGE,
					},
				],
			});
		} else {
			let results = fuzzysort.go(topic, preppedTutorialTitles);

			if (results.total === 0) {
				interaction.reply({
					content: `No matching result found. Try again with a different search term.`,
					ephemeral: true,
				});
			} else {
				let topResult = results[0];

				interaction.reply({
					embeds: [
						{
							description: `Have you gone through the tutorial page on [${
								topResult.target
							}](https://svelte.dev/tutorial/${
								tutorials[topResult.target]
							})?`,
							color: SVELTE_ORANGE,
						},
					],
				});
			}
		}
	},
});
