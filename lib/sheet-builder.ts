/*
 * Copyright (c) Kia Shakiba
 *
 * This source code is licensed under the GNU AGPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 */

enum Type {
	U8 = "u8",
	U32 = "u32",
	U64 = "u64",
	STRING = "str",
}

export class SheetBuilder {
	private _values: Array<Value> = [];

	public writeU8(value: number): SheetBuilder {
		this._values.push({ type: Type.U8, value, size: 1 });
		return this;
	}

	public writeU32(value: number): SheetBuilder {
		this._values.push({ type: Type.U32, value, size: 4 });
		return this;
	}

	public writeU64(value: number): SheetBuilder {
		this._values.push({ type: Type.U64, value, size: 8 });
		return this;
	}

	public writeString(value: string): SheetBuilder {
		this._values.push({
			type: Type.STRING, value, size: value.length
		});

		return this;
	}

	public toSheet(): Uint8Array {
		let data = new Uint8Array(this.size());
		let index = 0;

		for (let i=0; i<this._values.length; i++) {
			index = this.fill(data, index, this._values[i]);
		}

		return data;
	}

	private size(): number {
		return this._values.reduce((total: number, item: Value): number => {
			let size = item.type === Type.STRING ? item.size + 4 : item.size;

			return total + size;
		}, 0);
	}

	private fill(data: Uint8Array, index: number, value: Value): number {
		switch (value.type) {
			case Type.U8:
			case Type.U32:
			case Type.U64:
				return this.fillNumeric(data, index, value);

			case Type.STRING:
				return this.fillString(data, index, value);
		}
	}

	private fillNumeric(data: Uint8Array, index: number, value: NumericValue): number {
		let num = value.value;

		for (let i=index; i<index + value.size; i++) {
			data[i] = num & 0xff;
			num >>= 8;
		}

		return index + value.size;
	}

	private fillString(data: Uint8Array, index: number, value: StringValue): number {
		index = this.fillNumeric(data, index, {
			type: Type.U32,
			value: value.value.length,
			size: 4
		});

		let bytes = new TextEncoder().encode(value.value);
		let dataIndex = index;

		for (let i=0; i<bytes.length; i++) {
			data[dataIndex++] = bytes[i];
		}

		return dataIndex;
	}

	public static init(): SheetBuilder {
		return new SheetBuilder();
	}
}

type U8Value = { type: Type.U8, value: number, size: number };
type U32Value = { type: Type.U32, value: number, size: number };
type U64Value = { type: Type.U64, value: number, size: number };
type StringValue = { type: Type.STRING, value: string, size: number };

type NumericValue = U8Value | U32Value | U64Value;
type Value = U8Value | U32Value | U64Value | StringValue;
