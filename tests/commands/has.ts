import { expect } from '../chai';
import { client } from '../global';

describe('Has', () => {
	it('Should return true for a key which exists', async () => {
		await client.set('key', 'value');
		const response = await client.has('key');

		expect(response.ok).to.equal(true);
		if (response.ok) expect(response.data).to.equal(true);
	});

	it('Should return false for a key which does not exist', async () => {
		const response = await client.has('key');

		expect(response.ok).to.equal(true);
		if (response.ok) expect(response.data).to.equal(false);
	});
});
