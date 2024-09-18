import { expect } from '../chai';
import { client } from '../global';

describe('Wipe', () => {
	it('Should wipe all data in the cache', async () => {
		await client.set('key', 'value');

		const response = await client.wipe();
		expect(response.ok).to.equal(true);

		const got = await client.get('key');
		expect(got.ok).to.equal(false);
	});
});
