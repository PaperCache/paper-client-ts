import { Socket } from 'net';
import SheetReader from './sheet-reader';
import PaperError from './error';

export default class TcpClient {
	private _client: Socket;

	private _data: Array<Buffer> = [];
	private _bufSize: number = 0;

	constructor(client: Socket) {
		this._client = client;

		this._client.on('data', (chunk: Buffer) => {
			this._data.push(chunk);
			this._bufSize += chunk.length;
		});
	}

	public get bufSize(): number {
		return this._bufSize;
	}

	public async send(data: Uint8Array) {
		return new Promise((resolve) => {
			this._client.write(data, resolve);
		});
	}

	public reader(): SheetReader {
		return new SheetReader(this);
	}

	public chunk(maxSize: number): Buffer | undefined {
		if (!this._data.length) return;

		let chunk: Buffer | undefined;

		if (this._data[0].length <= maxSize) {
			this._bufSize -= this._data[0].length;
			chunk = this._data.shift();
		} else {
			this._bufSize -= maxSize;

			chunk = this._data[0].subarray(0, maxSize);

			let modified = Buffer.alloc(this._data[0].length - maxSize);
			this._data[0].copy(modified, 0, maxSize);
			this._data[0] = modified;
		}

		return chunk;
	}

	public async getBuffer(size: number): Promise<Buffer> {
		let initialBufSize = this._bufSize,
			buf = Buffer.alloc(0);

		if (initialBufSize >= size) {
			let chunk;

			while (size > 0 && (chunk = this.chunk(size))) {
				size -= chunk.length;
				buf = Buffer.concat([buf, chunk]);
			}

			return buf;
		}

		return new Promise((resolve) => {
			const gotChunks = () => {
				this._client.removeListener('data', handleChunk);
				return resolve(this.getBuffer(size));
			}

			const handleChunk = (chunk: Buffer) => {
				initialBufSize += chunk.length;

				if (initialBufSize >= size) {
					gotChunks();
				}
			}

			this._client.addListener('data', handleChunk);
		});
	}

	public disconnect() {
		this._client.destroy();
	}

	public static async connect(host: string, port: number): Promise<TcpClient> {
		return new Promise((resolve, reject) => {
			const client = new Socket();

			client.connect(port, host);

			client.on('connect', () => resolve(new TcpClient(client)));
			client.on('error', () => reject(new PaperError(PaperError.types.INVALID_ADDRESS)));
		});
	}
}
