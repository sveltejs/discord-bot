import { event } from 'jellycommands';
import urlRegex from 'url-regex';
import niceTry from 'nice-try';

// TODO discuss best way to store these ids
const linkOnlyChannels = [
    // Testing Channel
    '918915215368810566',

    // Showcase
    '479653552869081089',

    // Resources
    '837012201444999248',
];

export default event({
    name: 'messageCreate',

    run: async ({}, message) => {
        if (message.author.bot) return;

        if (linkOnlyChannels.includes(message.channel.id)) {
            const hasLink = urlRegex().test(message.content);

            if (!hasLink) {
                if (message.deletable) await message.delete();

                // Use nice try so I don't have to make a try catch block
                const dm = await niceTry.promise(async () =>
                    message.author.createDM(),
                );

                if (dm)
                    message.author.send({
                        embeds: [
                            {
                                description: `Your message in ${message.channel.toString()} was removed since it doesn't contain a link, if you are trying to showcase a project please post a link with your text. Otherwise all conversation should be inside a thread`,
                            },
                        ],
                    });
            }
        }
    },
});
