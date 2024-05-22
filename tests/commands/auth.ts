import { expect } from '../chai';
import { PaperClient } from '../../lib/paper-client';

let client: PaperClient;

beforeEach(async () => {
	client = await PaperClient.connect('paper://127.0.0.1:3145');
	await client.wipe();
});

afterEach(() => client.disconnect());

describe('Auth', () => {
	it('Should not authorize a client with an incorrect token', async () => {
		let response = await client.auth('incorrect_auth_token');

		expect(response.ok).to.equal(false);
		expect(response.data).to.not.equal('done');
	});

	it('Should authorize a client with a correct token', async () => {
		let response = await client.auth('auth_token');

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('done');
	});
});
