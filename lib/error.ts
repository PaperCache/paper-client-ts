enum ErrorType {
	INVALID_ADDRESS,
	CONNECTION_REFUSED,
	INTERNAL,
}

export default class PaperError extends Error {
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
		case ErrorType.CONNECTION_REFUSED:
			return "Connection refused.";

		case ErrorType.INTERNAL:
			return "Internal error.";
	}
}
