import TcpClient from './tcp-client';
export default class PaperClient {
    private _client;
    constructor(client: TcpClient);
    ping(): Promise<Response>;
    version(): Promise<Response>;
    get(key: Key): Promise<Response<Value>>;
    set(key: Key, value: Value, ttl: Ttl): Promise<Response>;
    del(key: Key): Promise<Response>;
    clear(): Promise<Response>;
    resize(size: number): Promise<Response>;
    policy(policy: Policy): Promise<Response>;
    stats(): Promise<StatsResponse>;
    private process;
    disconnect(): void;
    static connect(host: string, port: number): Promise<PaperClient>;
}
type Key = string;
type Value = string;
type Ttl = number;
type Message = string;
export declare enum Policy {
    LRU = 0,
    MRU = 1
}
type Response<T = Message> = {
    ok: boolean;
    data: T;
};
type OkResponse<T = Message> = {
    ok: true;
    data: T;
};
type NotOkResponse<T = Message> = {
    ok: false;
    data: T;
};
type Stats = {
    maxSize: number;
    usedSize: number;
    totalGets: number;
    missRatio: number;
};
type StatsResponse = OkResponse<Stats> | NotOkResponse;
export {};
