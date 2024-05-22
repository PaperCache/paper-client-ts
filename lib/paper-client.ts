import { TcpClient } from './tcp-client';
import { SheetBuilder } from './sheet-builder';
import { PaperError } from './error';

const MAX_RECONNECT_ATTEMPTS = 3;

enum CommandByte {
	PING = 0,
	VERSION = 1,

	AUTH = 2,

	GET = 3,
	SET = 4,
	DEL = 5,

	HAS = 6,
	PEEK = 7,
	TTL = 8,
	SIZE = 9,

	WIPE = 10,

	RESIZE = 11,
	POLICY = 12,

	STATS = 13,
}

export class PaperClient {
	private _addr: string;

	private _authToken: string = '';
	private _reconnectAttempts: number = 0;

	private _client: TcpClient;

	private constructor(addr: string, client: TcpClient) {
		this._addr = addr;
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

	public async auth(token: string): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.AUTH)
			.writeString(token)
			.toSheet();

		this._authToken = token;

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

		return await this.processHas(sheet);
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

		return await this.processSize(sheet);
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

	public async policy(policy: PaperPolicy): Promise<Response> {
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

		return await this.processStats(sheet);
	}

	public disconnect() {
		this._client.disconnect();
	}

	private async reconnect() {
		this._reconnectAttempts++;

		if (this._reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
			throw new PaperError(PaperError.types.CONNECTION_REFUSED);
		}

		this._client = await TcpClient.connect(this._addr);

		if (this._authToken !== '') {
			await this.auth(this._authToken);
		}
	}

	private async process(sheet: Uint8Array): Promise<Response> {
		try {
			await this._client.send(sheet);
			let reader = this._client.reader();

			let ok = await reader.readBoolean();
			let data = await reader.readString();

			this._reconnectAttempts = 0;
			return { ok, data };
		} catch {
			await this.reconnect();
			return this.process(sheet);
		}
	}

	private async processHas(sheet: Uint8Array): Promise<HasResponse> {
		try {
			await this._client.send(sheet);
			let reader = this._client.reader();

			let ok = await reader.readBoolean();

			if (!ok) {
				let data = await reader.readString();

				return { ok, data };
			}

			this._reconnectAttempts = 0;

			return {
				ok,
				data: await reader.readBoolean(),
			};
		} catch {
			await this.reconnect();
			return this.processHas(sheet);
		}
	}

	private async processSize(sheet: Uint8Array): Promise<SizeResponse> {
		try {
			await this._client.send(sheet);
			let reader = this._client.reader();

			let ok = await reader.readBoolean();

			if (!ok) {
				let data = await reader.readString();

				return { ok, data };
			}

			this._reconnectAttempts = 0;

			return {
				ok,
				data: await reader.readU64(),
			};
		} catch {
			await this.reconnect();
			return this.processSize(sheet);
		}
	}

	private async processStats(sheet: Uint8Array): Promise<StatsResponse> {
		try {
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

			this._reconnectAttempts = 0;

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
		} catch {
			await this.reconnect();
			return this.processStats(sheet);
		}
	}

	public static async connect(paperAddr: string): Promise<PaperClient> {
		const addr = parsePaperAddr(paperAddr);
		const client = await TcpClient.connect(addr);

		let paperClient = new PaperClient(addr, client);
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

export enum PaperPolicy {
	LFU = 0,
	FIFO = 1,
	LRU = 2,
	MRU = 3,
}

function getPolicyByIndex(index: number): PaperPolicy {
	switch (index) {
		case 0: return PaperPolicy.LFU;
		case 1: return PaperPolicy.FIFO;
		case 2: return PaperPolicy.LRU;
		case 3: return PaperPolicy.MRU;
	}

	throw new PaperError();
}

function parsePaperAddr(paperAddr: string): string {
	if (paperAddr.indexOf('paper://') !== 0) {
		throw new PaperError(PaperError.types.INVALID_ADDRESS);
	}

	return paperAddr.replace('paper://', '');
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

	policy: PaperPolicy;
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
