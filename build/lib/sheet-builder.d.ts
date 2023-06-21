export default class SheetBuilder {
    private _values;
    writeU8(value: number): SheetBuilder;
    writeU32(value: number): SheetBuilder;
    writeU64(value: number): SheetBuilder;
    writeString(value: string): SheetBuilder;
    toSheet(): Uint8Array;
    private size;
    private fill;
    private fillNumeric;
    private fillString;
    static init(): SheetBuilder;
}
