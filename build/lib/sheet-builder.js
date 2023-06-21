"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Type;
(function (Type) {
    Type["U8"] = "u8";
    Type["U32"] = "u32";
    Type["U64"] = "u64";
    Type["STRING"] = "str";
})(Type || (Type = {}));
class SheetBuilder {
    constructor() {
        this._values = [];
    }
    writeU8(value) {
        this._values.push({ type: Type.U8, value, size: 1 });
        return this;
    }
    writeU32(value) {
        this._values.push({ type: Type.U32, value, size: 4 });
        return this;
    }
    writeU64(value) {
        this._values.push({ type: Type.U64, value, size: 8 });
        return this;
    }
    writeString(value) {
        this._values.push({
            type: Type.STRING, value, size: value.length
        });
        return this;
    }
    toSheet() {
        let data = new Uint8Array(this.size());
        let index = 0;
        for (let i = 0; i < this._values.length; i++) {
            index = this.fill(data, index, this._values[i]);
        }
        return data;
    }
    size() {
        return this._values.reduce((total, item) => {
            let size = item.type === Type.STRING ? item.size + 4 : item.size;
            return total + size;
        }, 0);
    }
    fill(data, index, value) {
        switch (value.type) {
            case Type.U8:
            case Type.U32:
            case Type.U64:
                return this.fillNumeric(data, index, value);
            case Type.STRING:
                return this.fillString(data, index, value);
        }
    }
    fillNumeric(data, index, value) {
        let num = value.value;
        for (let i = index; i < index + value.size; i++) {
            data[i] = num & 0xff;
            num >>= 8;
        }
        return index + value.size;
    }
    fillString(data, index, value) {
        index = this.fillNumeric(data, index, {
            type: Type.U32,
            value: value.value.length,
            size: 4
        });
        let bytes = new TextEncoder().encode(value.value);
        let dataIndex = index;
        for (let i = 0; i < bytes.length; i++) {
            data[dataIndex++] = bytes[i];
        }
        return dataIndex;
    }
    static init() {
        return new SheetBuilder();
    }
}
exports.default = SheetBuilder;
