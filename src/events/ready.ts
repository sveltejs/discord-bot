import { event } from 'jellycommands';

export default event('ready', {
    run: () => console.log('Bot is online!'),
});
