import { expect } from '../chai';
import { client } from '../global';

describe('Set', () => {
	it('Should set an object without a TTL', async () => {
		const response = await client.set('key', 'value');
		expect(response.ok).to.equal(true);
	});

	it('Should set an object with a TTL', async () => {
		const response = await client.set('key', 'value', 3);
		expect(response.ok).to.equal(true);
	});

	it('Should correctly set the TTL of an object', async function() {
		this.timeout(3000);

		const setResponse = await client.set('key', 'value', 1);
		expect(setResponse.ok).to.equal(true);

		const got = await client.get('key');

		expect(got.ok).to.equal(true);
		if (got.ok) expect(got.data).to.equal('value');

		await wait(2000);

		const expired = await client.get('key');
		expect(expired.ok).to.equal(false);
	});
});

async function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
