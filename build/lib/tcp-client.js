"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const sheet_reader_1 = __importDefault(require("./sheet-reader"));
class TcpClient {
    constructor(client) {
        this._data = [];
        this._bufSize = 0;
        this._client = client;
        this._client.on('data', (chunk) => {
            this._data.push(chunk);
            this._bufSize += chunk.length;
        });
    }
    get bufSize() {
        return this._bufSize;
    }
    async send(data) {
        return new Promise((resolve, reject) => {
            this._client.write(data, resolve);
        });
    }
    reader() {
        return new sheet_reader_1.default(this);
    }
    chunk(maxSize) {
        if (!this._data.length)
            return;
        let chunk;
        if (this._data[0].length <= maxSize) {
            this._bufSize -= this._data[0].length;
            chunk = this._data.shift();
        }
        else {
            this._bufSize -= maxSize;
            chunk = this._data[0].slice(0, maxSize);
            let modified = Buffer.alloc(this._data[0].length - maxSize);
            this._data[0].copy(modified, 0, maxSize);
            this._data[0] = modified;
        }
        return chunk;
    }
    async getBuffer(size) {
        let initialBufSize = this._bufSize, buf = Buffer.alloc(0);
        if (initialBufSize >= size) {
            let chunk;
            while (size > 0 && (chunk = this.chunk(size))) {
                size -= chunk.length;
                buf = Buffer.concat([buf, chunk]);
            }
            return buf;
        }
        return new Promise((resolve, reject) => {
            const gotChunks = () => {
                this._client.removeListener('data', handleChunk);
                return resolve(this.getBuffer(size));
            };
            const handleChunk = (chunk) => {
                initialBufSize += chunk.length;
                if (initialBufSize >= size) {
                    gotChunks();
                }
            };
            this._client.addListener('data', handleChunk);
        });
    }
    disconnect() {
        this._client.destroy();
    }
    static async connect(host, port) {
        return new Promise((resolve, reject) => {
            const client = new net_1.Socket();
            client.connect(port, host);
            client.on('connect', () => {
                return resolve(new TcpClient(client));
            });
            client.on('error', reject);
        });
    }
}
exports.default = TcpClient;
