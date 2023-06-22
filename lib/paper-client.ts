import { Socket } from 'net';
import TcpClient from './tcp-client';
import SheetBuilder from './sheet-builder';

const OK_VALUE = 33;

export default class PaperClient {
	private _client: TcpClient;

	constructor(client: TcpClient) {
		this._client = client;
	}

	public async ping(): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(0)
			.toSheet();

		return await this.process(sheet);
	}

	public async version(): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(1)
			.toSheet();

		return await this.process(sheet);
	}

	public async get(key: Key): Promise<Response<Value>> {
		let sheet = SheetBuilder.init()
			.writeU8(2)
			.writeString(key)
			.toSheet();

		return await this.process(sheet);
	}

	public async set(key: Key, value: Value, ttl: Ttl = 0): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(3)
			.writeString(key)
			.writeString(value)
			.writeU32(ttl)
			.toSheet();

		return await this.process(sheet);
	}

	public async del(key: Key): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(4)
			.writeString(key)
			.toSheet();

		return await this.process(sheet);
	}

	public async clear(): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(5)
			.toSheet();

		return await this.process(sheet);
	}

	public async resize(size: number): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(6)
			.writeU64(size)
			.toSheet();

		return await this.process(sheet);
	}

	public async policy(policy: Policy): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(7)
			.writeU8(policy)
			.toSheet();

		return await this.process(sheet);
	}

	public async stats(): Promise<StatsResponse> {
		let sheet = SheetBuilder.init()
			.writeU8(8)
			.toSheet();

		await this._client.send(sheet);
		let reader = this._client.reader();

		let ok = await reader.readU8() === OK_VALUE;

		if (!ok) {
			let data = await reader.readString();

			return { ok, data };
		}

		let maxSize = await reader.readU64();
		let usedSize = await reader.readU64();
		let totalGets = await reader.readU64();
		let missRatio = await reader.readF64();
		let policyId = await reader.readString();

		return {
			ok,
			data: {
				maxSize,
				usedSize,
				totalGets,
				missRatio,
				policy: getPolicyById(policyId)
			}
		};
	}

	private async process(sheet: Uint8Array): Promise<Response> {
		await this._client.send(sheet);
		let reader = this._client.reader();

		let ok = await reader.readU8() === OK_VALUE;
		let data = await reader.readString();

		return { ok, data };
	}

	public disconnect() {
		this._client.disconnect();
	}

	public static async connect(host: string, port: number): Promise<PaperClient> {
		const client = await TcpClient.connect(host, port);
		return new PaperClient(client);
	}
}

type Key = string;
type Value = string;
type Ttl = number;
type Message = string;

export enum Policy {
	LRU = 0,
	MRU = 1,
}

function getPolicyById(id: string): Policy {
	switch (id) {
		case 'lru': return Policy.LRU;
		case 'mru': return Policy.MRU;
	}

	// TODO
	throw new Error();
}

type Response<T = Message> = {
	ok: boolean;
	data: T;
};

type OkResponse<T = Message> = {
	ok: true;
	data: T;
}

type NotOkResponse<T = Message> = {
	ok: false;
	data: T;
}

type Stats = {
	maxSize: number;
	usedSize: number;
	totalGets: number;
	missRatio: number;
	policy: Policy;
};

type StatsResponse =
	OkResponse<Stats> |
	NotOkResponse;
