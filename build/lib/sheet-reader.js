"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SheetReader {
    constructor(client) {
        this._client = client;
    }
    async readU8() {
        let buf = await this._client.getBuffer(1);
        if (!buf.length) {
            throw new Error();
        }
        return buf[0];
    }
    async readU32() {
        let buf = await this._client.getBuffer(4);
        if (buf.length < 4) {
            throw new Error();
        }
        return buf.readUint32LE();
    }
    async readU64() {
        let buf = await this._client.getBuffer(8);
        if (buf.length < 8) {
            throw new Error();
        }
        let value = buf.readBigUint64LE();
        return parseInt(value.toString());
    }
    async readF64() {
        let buf = await this._client.getBuffer(8);
        if (buf.length < 8) {
            throw new Error();
        }
        return buf.readDoubleLE();
    }
    async readString(length) {
        let buf = await this._client.getBuffer(length);
        if (buf.length < length) {
            throw new Error();
        }
        return buf.toString();
    }
}
exports.default = SheetReader;
