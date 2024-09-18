import { expect } from '../chai';
import { client } from '../global';

describe('Ping', () => {
	it('Should return pong', async () => {
		const response = await client.ping();

		expect(response.ok).to.equal(true);
		if (response.ok) expect(response.data).to.equal('pong');
	});
});
