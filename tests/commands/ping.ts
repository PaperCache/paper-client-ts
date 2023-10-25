import { expect } from '../chai';
import { client } from '../global';

describe('Ping', () => {
	it('Should return pong', async () => {
		let response = await client.ping();

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('pong');
	});
});
