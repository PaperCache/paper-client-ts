import TcpClient from './tcp-client';
import SheetBuilder from './sheet-builder';
import PaperError from './error';

enum CommandByte {
	PING = 0,
	VERSION = 1,

	GET = 2,
	SET = 3,
	DEL = 4,

	HAS = 5,
	PEEK = 6,
	TTL = 7,
	SIZE = 8,

	WIPE = 9,

	RESIZE = 10,
	POLICY = 11,

	STATS = 12,
}

export default class PaperClient {
	private _client: TcpClient;

	constructor(client: TcpClient) {
		this._client = client;
	}

	public async ping(): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.PING)
			.toSheet();

		return await this.process(sheet);
	}

	public async version(): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.VERSION)
			.toSheet();

		return await this.process(sheet);
	}

	public async get(key: Key): Promise<Response<Value>> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.GET)
			.writeString(key)
			.toSheet();

		return await this.process(sheet);
	}

	public async set(key: Key, value: Value, ttl: Ttl = 0): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.SET)
			.writeString(key)
			.writeString(value)
			.writeU32(ttl)
			.toSheet();

		return await this.process(sheet);
	}

	public async del(key: Key): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.DEL)
			.writeString(key)
			.toSheet();

		return await this.process(sheet);
	}

	public async has(key: Key): Promise<HasResponse> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.HAS)
			.writeString(key)
			.toSheet();

		await this._client.send(sheet);
		let reader = this._client.reader();

		let ok = await reader.readBoolean();

		if (!ok) {
			let data = await reader.readString();

			return { ok, data };
		}

		return {
			ok,
			data: await reader.readBoolean(),
		};
	}

	public async peek(key: Key): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.PEEK)
			.writeString(key)
			.toSheet();

		return await this.process(sheet);
	}

	public async ttl(key: Key, ttl: Ttl = 0): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.TTL)
			.writeString(key)
			.writeU32(ttl)
			.toSheet();

		return await this.process(sheet);
	}

	public async size(key: Key): Promise<SizeResponse> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.SIZE)
			.writeString(key)
			.toSheet();

		await this._client.send(sheet);
		let reader = this._client.reader();

		let ok = await reader.readBoolean();

		if (!ok) {
			let data = await reader.readString();

			return { ok, data };
		}

		return {
			ok,
			data: await reader.readU64(),
		};
	}

	public async wipe(): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.WIPE)
			.toSheet();

		return await this.process(sheet);
	}

	public async resize(size: number): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.RESIZE)
			.writeU64(size)
			.toSheet();

		return await this.process(sheet);
	}

	public async policy(policy: Policy): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.POLICY)
			.writeU8(policy)
			.toSheet();

		return await this.process(sheet);
	}

	public async stats(): Promise<StatsResponse> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.STATS)
			.toSheet();

		await this._client.send(sheet);
		let reader = this._client.reader();

		let ok = await reader.readBoolean();

		if (!ok) {
			let data = await reader.readString();

			return { ok, data };
		}

		let maxSize = await reader.readU64();
		let usedSize = await reader.readU64();
		let totalGets = await reader.readU64();
		let totalSets = await reader.readU64();
		let totalDels = await reader.readU64();
		let missRatio = await reader.readF64();
		let policyIndex = await reader.readU8();
		let uptime = await reader.readU64();

		return {
			ok,
			data: {
				maxSize,
				usedSize,
				totalGets,
				totalSets,
				totalDels,
				missRatio,
				policy: getPolicyByIndex(policyIndex),
				uptime: uptime
			}
		};
	}

	private async process(sheet: Uint8Array): Promise<Response> {
		await this._client.send(sheet);
		let reader = this._client.reader();

		let ok = await reader.readBoolean();
		let data = await reader.readString();

		return { ok, data };
	}

	public disconnect() {
		this._client.disconnect();
	}

	public static async connect(host: string, port: number): Promise<PaperClient> {
		const client = await TcpClient.connect(host, port);

		let paperClient = new PaperClient(client);
		let pingResponse = await paperClient.ping();

		if (!pingResponse.ok) {
			throw new PaperError(PaperError.types.CONNECTION_REFUSED);
		}

		return paperClient;
	}
}

type Key = string;
type Value = string;
type Ttl = number;
type Message = string;

export enum Policy {
	LFU = 0,
	FIFO = 1,
	LRU = 2,
	MRU = 3,
}

function getPolicyByIndex(index: number): Policy {
	switch (index) {
		case 0: return Policy.LFU;
		case 1: return Policy.FIFO;
		case 2: return Policy.LRU;
		case 3: return Policy.MRU;
	}

	throw new PaperError();
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
	totalSets: number;
	totalDels: number;

	missRatio: number;

	policy: Policy;
	uptime: number;
};

type HasResponse =
	OkResponse<boolean> |
	NotOkResponse;

type SizeResponse =
	OkResponse<number> |
	NotOkResponse;

type StatsResponse =
	OkResponse<Stats> |
	NotOkResponse;
