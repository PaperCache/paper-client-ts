import { Socket } from 'net';
import TcpClient from './tcp-client';
import SheetBuilder from './sheet-builder';

export default class PaperClient {
	private _client: TcpClient;

	constructor(client: TcpClient) {
		this._client = client;
	}

	public async ping(): Promise<string> {
		let sheet = SheetBuilder.create()
			.writeU8(0)
			.toSheet();
		return '';
	}

	public async connect(host: string, port: number): Promise<PaperClient> {
		const client = await TcpClient.connect(host, port);
		return new PaperClient(client);
	}
}
