import * as os from 'os';
import { ErrorCode } from '../enum/errorCode';

export default class Result {
	public readonly success: boolean;
	public readonly data?: any;
	public message?: string;
	public readonly statusCode?: number;
	public readonly errorCode?: string;
	public readonly hostname?: string;
	public readonly stack?: string;
	public readonly results?: Array<any>;

	constructor(success: boolean, message?: string, data?: any, results?: any, statusCode?: number, errorCode?: string) {
		this.data = data ? data : [];
		if (results) { this.results = results; }
		if (message) { this.message = message; }
		if (typeof results === 'object') {
			if (results instanceof Error) {
				this.message = results.message;
				if (results.stack) {
					this.stack = results.stack;
				}
			}
		}
		if (statusCode) { this.statusCode = statusCode; }
		this.errorCode = errorCode ? errorCode : ErrorCode.none;
		this.success = success;
		this.hostname = os.hostname();
	}
	public static success(data: any, message?: string, statusCode?: number, errorCode?: string): Result {
		return new Result(true, message, data, false, statusCode, errorCode);
	}

	public static error(error: any, data?: any, statusCode?: number, errorCode?: string): Result {
		if ('[object Object]' === Object.prototype.toString.call(error)) {
			return new Result(false, undefined, data, error.message, statusCode, errorCode);
		} else {
			return new Result(false, error, data, undefined, statusCode, errorCode);
		}
	}
}