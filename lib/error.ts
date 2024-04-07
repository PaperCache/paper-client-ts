enum ErrorType {
	INVALID_ADDRESS,

	CONNECTION_REFUSED,
	DISCONNECTED,

	INTERNAL,
}

export class PaperError extends Error {
	public static types: typeof ErrorType = ErrorType;

	constructor(errorType?: ErrorType) {
		if (errorType === undefined) {
			errorType = ErrorType.INTERNAL;
		}

		super(getErrorMessage(errorType));
	}
}

function getErrorMessage(errorType: ErrorType) {
	switch (errorType) {
		case ErrorType.INVALID_ADDRESS:
			return "Invalid address.";

		case ErrorType.CONNECTION_REFUSED:
			return "Connection refused.";

		case ErrorType.DISCONNECTED:
			return "Disconnected.";

		case ErrorType.INTERNAL:
			return "Internal error.";
	}
}
