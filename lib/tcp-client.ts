import { Socket } from 'net';
import SheetReader from './sheet-reader';
import PaperError from './error';

export default class TcpClient {
	private _socket: Socket;

	private _data: Array<Buffer> = [];
	private _bufSize: number = 0;

	constructor(socket: Socket) {
		this._socket = socket;

		this._socket.on('data', (chunk: Buffer) => {
			this._data.push(chunk);
			this._bufSize += chunk.length;
		});
	}

	public get bufSize(): number {
		return this._bufSize;
	}

	public async send(data: Uint8Array) {
		return new Promise((resolve) => {
			this._socket.write(data, resolve);
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

		if (!this._socket.readable || this._socket.closed || this._socket.destroyed) {
			throw new PaperError(PaperError.types.DISCONNECTED);
		}

		return new Promise((resolve, reject) => {
			const gotChunks = () => {
				this._socket.removeListener('data', handleChunk);
				this._socket.removeListener('timeout', handleTimeout);

				return resolve(this.getBuffer(size));
			};

			const handleChunk = (chunk: Buffer) => {
				initialBufSize += chunk.length;

				if (initialBufSize >= size) {
					gotChunks();
				}
			};

			const handleTimeout = () => {
				this._socket.removeListener('data', handleChunk);
				this._socket.removeListener('timeout', handleTimeout);

				return reject();
			};

			this._socket.addListener('data', handleChunk);
			this._socket.addListener('timeout', handleTimeout);
		});
	}

	public disconnect() {
		this._socket.destroy();
	}

	public static async connect(host: string, port: number): Promise<TcpClient> {
		return new Promise((resolve, reject) => {
			const socket = new Socket();

			socket.setTimeout(1000);
			socket.connect(port, host);

			socket.on('connect', () => resolve(new TcpClient(socket)));
			socket.on('error', () => reject(new PaperError(PaperError.types.INVALID_ADDRESS)));
		});
	}
}
