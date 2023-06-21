import { Socket } from 'net';

export default class TcpClient {
	private _client: Socket;

	constructor(client: Socket) {
		this._client = client;
	}

	public async send(data: Uint8Array) {
		return new Promise((resolve, reject) => {
			this._client.write(data, resolve);
		});
	}

	public async receive(data: Uint8Array) {
		return new Promise((resolve, reject) => {
			this._client.read();
		});
	}

	public static async connect(host: string, port: number): Promise<TcpClient> {
		return new Promise((resolve, reject) => {
			const client = new Socket();

			client.connect(port, host);

			client.on('connect', () => {
				resolve(new TcpClient(client));
			});

			client.on('error', reject);
		});
	}
}
