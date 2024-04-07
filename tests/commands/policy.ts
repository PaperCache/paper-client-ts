import { expect } from '../chai';
import { client } from '../global';
import { PaperPolicy } from '../../lib/paper-client';

describe('Policy', () => {
	it('Should set the cache\'s policy', async () => {
		const INITIAL_POLICY = PaperPolicy.LFU;
		const UPDATED_POLICY = PaperPolicy.LRU;

		let initial = await client.policy(INITIAL_POLICY);

		expect(initial.ok).to.equal(true);
		expect(initial.data).to.equal('done');
		expect(await getCurrentPolicy()).to.equal(INITIAL_POLICY);

		let updated = await client.policy(UPDATED_POLICY);

		expect(updated.ok).to.equal(true);
		expect(updated.data).to.equal('done');
		expect(await getCurrentPolicy()).to.equal(UPDATED_POLICY);
	});
});

async function getCurrentPolicy(): Promise<PaperPolicy> {
	let response = await client.stats();

	if (!response.ok) {
		throw new Error();
	}

	return response.data.policy;
}
