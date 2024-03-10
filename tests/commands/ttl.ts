import { expect } from '../chai';
import { client } from '../global';

describe('TTL', () => {
	it('Should return ok for a key which exists', async () => {
		await client.set('key', 'value');
		let response = await client.ttl('key', 5);

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('done');
	});

	it('Should return not ok for a key which does not exist', async () => {
		let response = await client.ttl('key', 5);

		expect(response.ok).to.equal(false);
		expect(response.data).to.not.be.empty;
	});
});
