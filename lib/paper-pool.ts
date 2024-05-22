import { PaperClient } from './paper-client';

export class PaperPool {
	private _clients: PaperClient[];
	private _index: number = 0;

	constructor(clients: PaperClient[]) {
		this._clients = clients;
	}

	public async auth(token: string) {
		await Promise.all(this._clients.map(client => client.auth(token)));
	}

	public client() {
		const index = this._index;
		this._index = (index + 1) % this._clients.length;
		return this._clients[index];
	}

	public disconnect() {
		for (const client of this._clients) {
			client.disconnect()
		}
	}

	public static async connect(paper_addr: string, size: number): Promise<PaperPool> {
		let clients: PaperClient[] = [];

		for (let i=0; i<size; i++) {
			clients.push(await PaperClient.connect(paper_addr));
		}

		return new PaperPool(clients);
	}
}
