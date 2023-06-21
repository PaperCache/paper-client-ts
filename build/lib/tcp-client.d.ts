/// <reference types="node" />
/// <reference types="node" />
import { Socket } from 'net';
import SheetReader from './sheet-reader';
export default class TcpClient {
    private _client;
    private _data;
    private _bufSize;
    constructor(client: Socket);
    get bufSize(): number;
    send(data: Uint8Array): Promise<unknown>;
    reader(): SheetReader;
    chunk(maxSize: number): Buffer | undefined;
    getBuffer(size: number): Promise<Buffer>;
    disconnect(): void;
    static connect(host: string, port: number): Promise<TcpClient>;
}
