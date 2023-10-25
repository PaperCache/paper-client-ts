import TcpClient from './tcp-client';

const OK_VALUE = 33;

export default class SheetReader {
	private _client: TcpClient;

	constructor(client: TcpClient) {
		this._client = client;
	}

	public async readBoolean(): Promise<boolean> {
		let byte = await this.readU8();
		return byte === OK_VALUE;
	}

	public async readU8(): Promise<number> {
		let buf = await this._client.getBuffer(1);

		if (!buf.length) {
			// TODO
			throw new Error();
		}

		return buf[0];
	}

	public async readU32(): Promise<number> {
		let buf = await this._client.getBuffer(4);

		if (buf.length < 4) {
			// TODO
			throw new Error();
		}

		return buf.readUint32LE();
	}

	public async readU64(): Promise<number> {
		let buf = await this._client.getBuffer(8);

		if (buf.length < 8) {
			// TODO
			throw new Error();
		}

		let value = buf.readBigUint64LE();
		return parseInt(value.toString());
	}

	public async readF64(): Promise<number> {
		let buf = await this._client.getBuffer(8);

		if (buf.length < 8) {
			// TODO
			throw new Error();
		}

		return buf.readDoubleLE();
	}

	public async readString(): Promise<string> {
		let len = await this.readU32();
		let buf = await this._client.getBuffer(len);

		if (buf.length < len) {
			// TODO
			throw new Error();
		}

		return buf.toString();
	}
}
