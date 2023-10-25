import { expect } from '../chai';
import { client } from '../global';

describe('Get', () => {
	it('Should return ok for a key which exists', async () => {
		await client.set('key', 'value');
		let response = await client.get('key');

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('value');
	});

	it('Should return not ok for a key which does not exist', async () => {
		let response = await client.get('key');

		expect(response.ok).to.equal(false);
		expect(response.data).to.not.be.empty;
	});
});
