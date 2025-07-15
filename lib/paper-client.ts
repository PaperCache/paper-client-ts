/*
 * Copyright (c) Kia Shakiba
 *
 * This source code is licensed under the GNU AGPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TcpClient } from "./tcp-client";
import { SheetBuilder } from "./sheet-builder";
import { PaperError } from "./error";

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

	STATUS = 13,
}

export class PaperClient {
	private _addr: string;

	private _authToken: string = "";
	private _reconnectAttempts: number = 0;

	private _client: TcpClient;

	private constructor(addr: string, client: TcpClient) {
		this._addr = addr;
		this._client = client;
	}

	public async ping(): Promise<DataResponse> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.PING)
			.toSheet();

		return await this.processData(sheet);
	}

	public async version(): Promise<DataResponse> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.VERSION)
			.toSheet();

		return await this.processData(sheet);
	}

	public async auth(token: string): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.AUTH)
			.writeString(token)
			.toSheet();

		this._authToken = token;

		return await this.process(sheet);
	}

	public async get(key: Key): Promise<DataResponse> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.GET)
			.writeString(key)
			.toSheet();

		return await this.processData(sheet);
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

	public async has(key: Key): Promise<DataResponse<boolean>> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.HAS)
			.writeString(key)
			.toSheet();

		return await this.processHas(sheet);
	}

	public async peek(key: Key): Promise<DataResponse> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.PEEK)
			.writeString(key)
			.toSheet();

		return await this.processData(sheet);
	}

	public async ttl(key: Key, ttl: Ttl = 0): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.TTL)
			.writeString(key)
			.writeU32(ttl)
			.toSheet();

		return await this.process(sheet);
	}

	public async size(key: Key): Promise<DataResponse<number>> {
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

	public async policy(policy: string): Promise<Response> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.POLICY)
			.writeString(policy)
			.toSheet();

		return await this.process(sheet);
	}

	public async status(): Promise<DataResponse<Status>> {
		let sheet = SheetBuilder.init()
			.writeU8(CommandByte.STATUS)
			.toSheet();

		return await this.processStatus(sheet);
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

		const handshakeResponse = await handshake(this._client);

		if (!handshakeResponse.ok) {
			throw handshakeResponse.error;
		}

		if (this._authToken !== "") {
			await this.auth(this._authToken);
		}
	}

	private async process(sheet: Uint8Array): Promise<Response> {
		try {
			await this._client.send(sheet);
			let reader = this._client.reader();

			const ok = await reader.readBoolean();
			this._reconnectAttempts = 0;

			if (ok) return { ok };

			return {
				ok: false,
				error: await PaperError.fromSheet(reader),
			};
		} catch {
			await this.reconnect();
			return this.process(sheet);
		}
	}

	private async processData(sheet: Uint8Array): Promise<DataResponse> {
		try {
			await this._client.send(sheet);
			let reader = this._client.reader();

			const ok = await reader.readBoolean();
			this._reconnectAttempts = 0;

			if (ok) {
				const data = await reader.readString();
				return { ok, data };
			}

			return {
				ok,
				error: await PaperError.fromSheet(reader),
			};
		} catch {
			await this.reconnect();
			return this.processData(sheet);
		}
	}

	private async processHas(sheet: Uint8Array): Promise<DataResponse<boolean>> {
		try {
			await this._client.send(sheet);
			let reader = this._client.reader();

			const ok = await reader.readBoolean();
			this._reconnectAttempts = 0;

			if (ok) {
				const data = await reader.readBoolean();
				return { ok, data };
			}

			return {
				ok,
				error: await PaperError.fromSheet(reader),
			};
		} catch {
			await this.reconnect();
			return this.processHas(sheet);
		}
	}

	private async processSize(sheet: Uint8Array): Promise<DataResponse<number>> {
		try {
			await this._client.send(sheet);
			let reader = this._client.reader();

			const ok = await reader.readBoolean();
			this._reconnectAttempts = 0;

			if (ok) {
				const data = await reader.readU32();
				return { ok, data };
			}

			return {
				ok,
				error: await PaperError.fromSheet(reader),
			};
		} catch {
			await this.reconnect();
			return this.processSize(sheet);
		}
	}

	private async processStatus(sheet: Uint8Array): Promise<DataResponse<Status>> {
		try {
			await this._client.send(sheet);
			let reader = this._client.reader();

			const ok = await reader.readBoolean();
			this._reconnectAttempts = 0;

			if (!ok) {
				const error = await PaperError.fromSheet(reader);
				return { ok, error };
			}

			const pid = await reader.readU32();

			const maxSize = await reader.readU64();
			const usedSize = await reader.readU64();
			const numObjects = await reader.readU64();

			const rss = await reader.readU64();
			const hwm = await reader.readU64();

			const totalGets = await reader.readU64();
			const totalSets = await reader.readU64();
			const totalDels = await reader.readU64();

			const missRatio = await reader.readF64();

			const numPolicies = await reader.readU32();
			const policies: string[] = [];

			for (let i=0; i<numPolicies; i++) {
				policies.push(await reader.readString());
			}

			const policy = await reader.readString();
			const isAutoPolicy = await reader.readBoolean();

			const uptime = await reader.readU64();

			return {
				ok,
				data: {
					pid,

					maxSize,
					usedSize,
					numObjects,

					rss,
					hwm,

					totalGets,
					totalSets,
					totalDels,

					missRatio,

					policies,
					policy,
					isAutoPolicy,

					uptime,
				}
			};
		} catch {
			await this.reconnect();
			return this.processStatus(sheet);
		}
	}

	public static async connect(paperAddr: string): Promise<PaperClient> {
		const addr = parsePaperAddr(paperAddr);
		const client = await TcpClient.connect(addr);

		const handshakeResponse = await handshake(client);

		if (!handshakeResponse.ok) {
			throw handshakeResponse.error;
		}

		let paperClient = new PaperClient(addr, client);

		return paperClient;
	}
}

type Key = string;
type Value = string;
type Ttl = number;
type Message = string;

function parsePaperAddr(paperAddr: string): string {
	if (paperAddr.indexOf("paper://") !== 0) {
		throw new PaperError(PaperError.types.INVALID_ADDRESS);
	}

	return paperAddr.replace("paper://", "");
}

async function handshake(client: TcpClient): Promise<Response> {
	let reader = client.reader();

	const ok = await reader.readBoolean();
	if (ok) return { ok };

	return {
		ok: false,
		error: await PaperError.fromSheet(reader),
	};
}

type Status = {
	pid: number;

	maxSize: number;
	usedSize: number;
	numObjects: number;

	rss: number;
	hwm: number;

	totalGets: number;
	totalSets: number;
	totalDels: number;

	missRatio: number;

	policies: string[];
	policy: string;
	isAutoPolicy: boolean;

	uptime: number;
};

type OkResponse<T = Message> = {
	ok: true;
	data: T;
}

type NotOkResponse = {
	ok: false;
	error: PaperError;
}

type Response = { ok: true } | NotOkResponse;

type DataResponse<T = string> =
	OkResponse<T> |
	NotOkResponse;
