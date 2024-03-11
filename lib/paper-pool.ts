import PaperClient from './paper-client';

export default class PaperPool {
	private _clients: PaperClient[];
	private _index: number = 0;

	constructor(clients: PaperClient[]) {
		this._clients = clients;
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

	public static async connect(
		host: string,
		port: number,
		size: number
	): Promise<PaperPool> {
		let clients: PaperClient[] = [];

		for (let i=0; i<size; i++) {
			clients.push(await PaperClient.connect(host, port));
		}

		return new PaperPool(clients);
	}
}
