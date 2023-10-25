import { expect } from '../chai';
import { client } from '../global';

describe('Wipe', () => {
	it('Should wipe all data in the cache', async () => {
		await client.set('key', 'value');
		let response = await client.wipe();

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('done');

		let got = await client.get('key');

		expect(got.ok).to.equal(false);
		expect(got.data).to.not.be.empty;
	});
});
