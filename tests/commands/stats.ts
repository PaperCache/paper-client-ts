import { expect } from '../chai';
import { client } from '../global';

describe('Stats', () => {
	it('Should get the cache\'s stats', async () => {
		let response = await client.stats();

		expect(response.ok).to.equal(true);
		if (!response.ok) return;

		expect(response.data).to.have.all.keys(
			'maxSize',
			'usedSize',

			'totalGets',
			'totalSets',
			'totalDels',

			'missRatio',

			'policy',
			'uptime'
		);
	});
});
