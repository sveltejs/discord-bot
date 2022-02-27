import { event } from 'jellycommands';

export default event({
	name: 'ready',
	run: (_, client) => console.log(client.user.tag, 'is online!'),
});
