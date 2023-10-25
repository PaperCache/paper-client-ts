import { expect } from '../chai';
import { client } from '../global';

describe('Version', () => {
	it('Should return the cache\'s version', async () => {
		let response = await client.version();

		expect(response.ok).to.equal(true);
		expect(response.data).to.not.be.empty;
	});
});
