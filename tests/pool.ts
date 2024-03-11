import { expect } from './chai';
import PaperPool from './../lib/paper-pool';

describe('Pool', () => {
	it('Should allow the use of a client', async () => {
		const pool = await PaperPool.connect('127.0.0.1', 3145, 2);
		const response = await pool.client().ping();

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('pong');

		pool.disconnect();
	});
});
