import TcpClient from './tcp-client';
export default class SheetReader {
    private _client;
    constructor(client: TcpClient);
    readU8(): Promise<number>;
    readU32(): Promise<number>;
    readU64(): Promise<number>;
    readF64(): Promise<number>;
    readString(length: number): Promise<string>;
}
