import PaperClient from '../lib/paper-client';

export let client: PaperClient;

before(async () => {
	client = await PaperClient.connect("127.0.0.1", 3145);
});

after(() => client.disconnect());

beforeEach(async () => {
	await client.auth('auth_token');
	await client.wipe();
});
