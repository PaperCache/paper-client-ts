import { expect } from '../chai';
import { client } from '../global';

describe('Resize', () => {
	it('Should resize the cache', async () => {
		const INITIAL_SIZE = 10 * Math.pow(1024, 2);
		const UPDATED_SIZE = 20 * Math.pow(1024, 2);

		let initial = await client.resize(INITIAL_SIZE);

		expect(initial.ok).to.equal(true);
		expect(initial.data).to.equal('done');
		expect(await getCurrentSize()).to.equal(INITIAL_SIZE);

		let updated = await client.resize(UPDATED_SIZE);

		expect(updated.ok).to.equal(true);
		expect(updated.data).to.equal('done');
		expect(await getCurrentSize()).to.equal(UPDATED_SIZE);
	});
});

async function getCurrentSize(): Promise<number> {
	let response = await client.stats();

	if (!response.ok) {
		throw new Error();
	}

	return response.data.maxSize;
}
