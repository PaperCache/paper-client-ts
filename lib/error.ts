import { SheetReader } from "./sheet-reader";

enum ErrorType {
	INTERNAL,

	INVALID_ADDRESS,

	CONNECTION_REFUSED,
	MAX_CONNECTIONS_EXCEEDED,
	UNAUTHORIZED,
	DISCONNECTED,

	KEY_NOT_FOUND,

	ZERO_VALUE_SIZE,
	EXCEEDING_VALUE_SIZE,

	ZERO_CACHE_SIZE,
}

export class PaperError extends Error {
	private _type: ErrorType;
	public static types: typeof ErrorType = ErrorType;

	constructor(errorType?: ErrorType) {
		if (errorType === undefined) {
			errorType = ErrorType.INTERNAL;
		}

		super(getErrorMessage(errorType));
		this._type = errorType;
	}

	public type(): ErrorType {
		return this._type;
	}

	public static async fromSheet(reader: SheetReader): Promise<PaperError> {
		let code = await reader.readU8();

		if (code === 0) {
			let cache_code = await reader.readU8();
			let error_type = typeFromCacheCode(cache_code);

			return new PaperError(error_type);
		}

		let error_type = typeFromCode(code);
		return new PaperError(error_type);
	}
}

function typeFromCode(code: number): ErrorType {
	switch (code) {
		case 2: return ErrorType.MAX_CONNECTIONS_EXCEEDED;
		case 3: return ErrorType.UNAUTHORIZED;
		default: return ErrorType.INTERNAL;
	}
}

function typeFromCacheCode(code: number): ErrorType {
	switch (code) {
		case 1: return ErrorType.KEY_NOT_FOUND;

		case 2: return ErrorType.ZERO_VALUE_SIZE;
		case 3: return ErrorType.EXCEEDING_VALUE_SIZE;

		case 4: return ErrorType.ZERO_CACHE_SIZE;

		default: return ErrorType.INTERNAL;
	}
}

function getErrorMessage(errorType: ErrorType) {
	switch (errorType) {
		case ErrorType.INTERNAL:
			return "Internal error.";

		case ErrorType.INVALID_ADDRESS:
			return "Invalid address.";

		case ErrorType.CONNECTION_REFUSED:
			return "Connection refused.";

		case ErrorType.MAX_CONNECTIONS_EXCEEDED:
			return "Maximum number of connections exceeded.";

		case ErrorType.UNAUTHORIZED:
			return "Unauthorized.";

		case ErrorType.DISCONNECTED:
			return "Disconnected.";

		case ErrorType.KEY_NOT_FOUND:
			return "Key not found.";

		case ErrorType.ZERO_VALUE_SIZE:
			return "Size of value cannot be zero.";

		case ErrorType.EXCEEDING_VALUE_SIZE:
			return "Size of value cannot exceed cache size.";

		case ErrorType.ZERO_CACHE_SIZE:
			return "Size of cache cannot be zero.";
	}
}
