import { expect } from './chai';
import { PaperPool } from './../lib/paper-pool';

describe('Pool', () => {
	it('Should allow the use of a client', async () => {
		const pool = await PaperPool.connect('paper://127.0.0.1:3145', 2);
		const response = await pool.client().ping();

		expect(response.ok).to.equal(true);
		expect(response.data).to.equal('pong');

		pool.disconnect();
	});

	it('Should authorize clients', async () => {
		const pool = await PaperPool.connect('paper://127.0.0.1:3145', 2);

		const unauthorized_set = await pool.client().set('key', 'value');
		expect(unauthorized_set.ok).to.equal(false);

		await pool.auth('auth_token');

		const authorized_set = await pool.client().set('key', 'value');
		expect(authorized_set.ok).to.equal(true);

		pool.disconnect();
	});
});
