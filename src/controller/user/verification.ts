import i18n from 'i18n';
import { ErrorCode } from '../../enum/errorCode';
import { ObjectType } from '../../enum/objectType';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
import Database from '../core/database';
import User from './user';

require('dotenv').config();

export default class Verify {

	public static async validateVerificationCode(user: User, deleteOnVerify: boolean): Promise<Result> {
		if (user.code && user.verificationCodeId && user.email) {
			const body: any = {
				objType: ObjectType.VERIFICATIONCODE,
				conditions: {
					_id: user.verificationCodeId,
					code: user.code,
					email: user.email
				}
			};

			const result = await Database.query(body);
			if (result.success && result.data.length > 0 && (new Date(result.data[0].expiresOn) > new Date())) {
				if (deleteOnVerify) {
					const deleteVerificationCode: any = await Database.delete(result.data);
					if (!deleteVerificationCode || !deleteVerificationCode.success) {
						return deleteVerificationCode;
					}
				}
				return Result.success({_id: result.data[0]._id}, i18n.__('Code verified successfully'), StatusCode.success, ErrorCode.none);
			}
			return Result.error(i18n.__('verificationCode.invalidCode:Invalid or Expired code'), '', StatusCode.badRequest);
		} else {
			return Result.error(i18n.__('verificationCode.validateVerificationCode.missingFields:Please enter code, verificationCodeId or email'), '', StatusCode.badRequest, ErrorCode.missingField);
		}
	}

	public static async deleteVerificationCode(verificationCode: any): Promise<Result> {
		if (verificationCode.code && verificationCode.userName) {
			const body: any = {
				objType: ObjectType.VERIFICATIONCODE,
				conditions: {
					userName: verificationCode.userName,
					code: verificationCode.code
				}
			};
			const result = await Database.query(body);
			if (result.success && result.data.length > 0) {
				return await Database.delete(result.data[0]);
			}
			return Result.error(i18n.__('Verify.deleteVerificationCode.recordNotFound:Code not Found'), '', StatusCode.notFound, ErrorCode.notFound);
		} else {
			return Result.error(i18n.__('Verify.deleteVerificationCode.MissingField:Please enter code, username'), verificationCode, StatusCode.badRequest, ErrorCode.invalidData);
		}
	}
}
