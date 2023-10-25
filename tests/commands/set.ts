import { expect } from '../chai';
import { client } from '../global';

describe('Set', () => {
	it('Should set a key without a TTL', async () => {
		let response = await client.set('key', 'value');

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('done');
	});

	it('Should set a key with a TTL', async () => {
		let response = await client.set('key', 'value', 3);

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('done');
	});

	it('Should correctly set the TTL of an object', async function() {
		this.timeout(3000);

		let setResponse = await client.set('key', 'value', 1);

		expect(setResponse.ok).to.equal(true);
		expect(setResponse.data).to.equal('done');

		let got = await client.get('key');

		expect(got.ok).to.equal(true);
		expect(got.data).to.equal('value');

		await wait(2000);

		let expired = await client.get('key');

		expect(expired.ok).to.equal(false);
		expect(expired.data).to.not.be.empty;
	});
});

async function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
