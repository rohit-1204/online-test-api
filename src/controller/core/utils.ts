import crypto from "crypto";
import path from 'path';
const specialChars = '@#$!';
const passwordChars = 'abcdefghjkmnpqrstwxy';
const digitChars = '2345689';

export default class Utils {
	static _rootDir: string = '';
	static firstIteration = false;
	static objectArray: string[] = [];

	public static rootDir() {
		if (Utils._rootDir) {
			return Utils._rootDir;
		}
		if (path.dirname(__dirname).endsWith('dist')) {
			return path.resolve(__dirname + './../../');
		}
		return path.resolve(__dirname + './../../');
	}

	public static getRegex(name: any) {
		const regex: any = {};
		regex.email = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
		regex.pattern = new RegExp(/(##)\w+##/g);
		regex.Phone = new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/);
		regex.userName = new RegExp(/^(^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$|^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$)$/);
		regex.instancePrefix = new RegExp(/^[a-z0-9](?!.*--)[a-z0-9-]{1,6}[a-z0-9]$/);
		return regex[name];
	}

	public static generateSalt() {
		let salt = '';
		let isSpecialUsed = false;
		let isUpperUsed = false;
		let isDigitUsed = false;
		const passwordLength = 16 + Math.ceil(Math.random() * 6);

		for (let iIndex = 0; iIndex < passwordLength; ++iIndex) {
			const whichChar = Math.ceil(Math.random() * 30);
			let char;
			if (whichChar < 3 || (iIndex > 10 && !isSpecialUsed)) {
				isSpecialUsed = true;
				char = specialChars[Math.ceil(Math.random() * 1000) % specialChars.length];
			} else if (whichChar > 25 || (iIndex > 8 && !isDigitUsed)) {
				isDigitUsed = true;
				char = digitChars[Math.ceil(Math.random() * 1000) % digitChars.length];
			} else if (whichChar > 20 || (iIndex > 4 && !isUpperUsed)) {
				isUpperUsed = true;
				char = passwordChars[Math.ceil(Math.random() * 1000) % passwordChars.length].toUpperCase();
			} else {
				char = passwordChars[Math.ceil(Math.random() * 1000) % passwordChars.length];
			}
			salt += char;
		}
		return salt;

	}

	public static sha256(text: string, seed: string): string {
		return crypto.createHmac('sha256', new Buffer(seed)).update(text).digest('base64');
	}

	public static getVerificationCode(source: String) {
		switch (source) {
			case 'email':
				return this.generateSalt();
			case 'Phone':
				return this.generateVerificationCode();
		}
	}

	public static generateVerificationCode() {
		return Math.floor(100000 + (Math.random() * 900000)).toString();
	}

	public static setExpiresOn(minutes: any) {
		const date = new Date();
		date.setTime(date.getTime() + (minutes * 60 * 1000));
		return date;
	}
}
