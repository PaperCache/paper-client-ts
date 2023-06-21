enum Type {
	U8 = 'u8',
	U32 = 'u32',
	U64 = 'u64',
	STRING = 'str',
}

export default class SheetBuilder {
	private _values: Array<Value> = [];

	public writeU8(value: number) {
		this._values.push({ type: Type.U8, value, size: 1 });
	}

	public writeU32(value: number) {
		this._values.push({ type: Type.U32, value, size: 4 });
	}

	public writeU64(value: number) {
		this._values.push({ type: Type.U64, value, size: 8 });
	}

	public writeString(value: string) {
		this._values.push({
			type: Type.STRING, value, size: value.length
		});
	}

	public toSheet(): Uint8Array {
		let data = new Uint8Array(this.size());

		for (let i=0; i<this._values.length; i++) {
		}

		return data;
	}

	private size(): number {
		return this._values.reduce((total: number, item: Value): number => {
			return total + item.size;
		}, 0);
	}

	public static create(): SheetBuilder {
		return new SheetBuilder();
	}
}

type Value =
	{ type: Type.U8, value: number, size: number } |
	{ type: Type.U32, value: number, size: number } |
	{ type: Type.U64, value: number, size: number } |
	{ type: Type.STRING, value: string, size: number }
	;
