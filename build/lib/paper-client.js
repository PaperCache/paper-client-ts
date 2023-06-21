"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Policy = void 0;
const tcp_client_1 = __importDefault(require("./tcp-client"));
const sheet_builder_1 = __importDefault(require("./sheet-builder"));
const OK_VALUE = 33;
class PaperClient {
    constructor(client) {
        this._client = client;
    }
    async ping() {
        let sheet = sheet_builder_1.default.init()
            .writeU8(0)
            .toSheet();
        return await this.process(sheet);
    }
    async version() {
        let sheet = sheet_builder_1.default.init()
            .writeU8(1)
            .toSheet();
        return await this.process(sheet);
    }
    async get(key) {
        let sheet = sheet_builder_1.default.init()
            .writeU8(2)
            .writeString(key)
            .toSheet();
        return await this.process(sheet);
    }
    async set(key, value, ttl) {
        let sheet = sheet_builder_1.default.init()
            .writeU8(3)
            .writeString(key)
            .writeString(value)
            .writeU32(ttl)
            .toSheet();
        return await this.process(sheet);
    }
    async del(key) {
        let sheet = sheet_builder_1.default.init()
            .writeU8(4)
            .writeString(key)
            .toSheet();
        return await this.process(sheet);
    }
    async clear() {
        let sheet = sheet_builder_1.default.init()
            .writeU8(5)
            .toSheet();
        return await this.process(sheet);
    }
    async resize(size) {
        let sheet = sheet_builder_1.default.init()
            .writeU8(6)
            .writeU64(size)
            .toSheet();
        return await this.process(sheet);
    }
    async policy(policy) {
        let sheet = sheet_builder_1.default.init()
            .writeU8(7)
            .writeU8(policy)
            .toSheet();
        return await this.process(sheet);
    }
    async stats() {
        let sheet = sheet_builder_1.default.init()
            .writeU8(8)
            .toSheet();
        await this._client.send(sheet);
        let reader = this._client.reader();
        let ok = await reader.readU8() === OK_VALUE;
        if (!ok) {
            let len = await reader.readU32();
            let data = await reader.readString(len);
            return { ok, data };
        }
        let maxSize = await reader.readU64();
        let usedSize = await reader.readU64();
        let totalGets = await reader.readU64();
        let missRatio = await reader.readF64();
        return {
            ok,
            data: {
                maxSize,
                usedSize,
                totalGets,
                missRatio
            }
        };
    }
    async process(sheet) {
        await this._client.send(sheet);
        let reader = this._client.reader();
        let ok = await reader.readU8() === OK_VALUE;
        let len = await reader.readU32();
        let data = await reader.readString(len);
        return { ok, data };
    }
    disconnect() {
        this._client.disconnect();
    }
    static async connect(host, port) {
        const client = await tcp_client_1.default.connect(host, port);
        return new PaperClient(client);
    }
}
exports.default = PaperClient;
var Policy;
(function (Policy) {
    Policy[Policy["LRU"] = 0] = "LRU";
    Policy[Policy["MRU"] = 1] = "MRU";
})(Policy || (exports.Policy = Policy = {}));
