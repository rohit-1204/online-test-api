import i18n from 'i18n';
import config from '../../../config';
import { ErrorCode } from '../../enum/errorCode';
import { ObjectType } from '../../enum/objectType';
import { operationTypes } from '../../enum/operationTypes';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
import { CustomEngine } from '../core/customEngine';
import Database from '../core/database';
import Utils from '../core/utils';
import User from '../user/user';
require('dotenv').config();

export default class Auth {
	public static async login(user: any): Promise<Result> {
		let condition: any;
		if (!user.userName || !user.password) {
			return !user.userName ? Result.error(i18n.__('Auth.login.missinguserName:Username is missing'), '', StatusCode.badRequest, ErrorCode.missingField) :
				Result.error(i18n.__('Auth.login.missingPassword:Password is missing'), '', StatusCode.badRequest, ErrorCode.missingField);
		}
		if (Utils.getRegex('email').test(user.userName)) {
			condition = { email: user.userName };
		}
		if (!condition) {
			return Result.error(i18n.__('Auth.login.invalidEmailFormat:Please enter valid email'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		const body = {
			objType: ObjectType.USER,
			conditions: condition
		};
		const result = await Database.query(body);
		if (!result || !result.success) {
			return result;
		}
		if (result.data.length === 0 || (result.data.length > 0 && result.data[0].password && result.data[0].password !== Utils.sha256(user.password, result.data[0].salt))) {
			return Result.error(i18n.__('Auth.login.invalidUserNameOrPasswrd:Invalid username or password'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		const resultToRet: any = {};
		if (result.data[0].isMFAEnabled) {
			const codeToSave: any = {
				objType: ObjectType.VERIFICATIONCODE,
				code: Utils.getVerificationCode('Phone'),
				email: result.data[0].email,
				operationType: operationTypes.LOGIN,
				expiresOn: Utils.setExpiresOn(config.settingRecord.verificationCodeExpiresIn),
				userId: result.data[0]._id
			};
			const codeResult: any = await Database.save(codeToSave);
			if (!codeResult || !codeResult.success) {
				return codeResult;
			}
			resultToRet['isCodeRequired'] = true;
			resultToRet['verificationCodeId'] = codeResult.data[0]._id;
			// send code to user
			const body: any = {};
			body['userName'] = codeToSave.email;
			body['code'] = codeToSave.code;
			body['event'] = 'login';
			body['subject'] = 'Your Online Test verification code';
			body['text'] = 'Login';
			const sendCodeRes: any = await User.sendCodeForUser(body);
			if (!sendCodeRes || !sendCodeRes.success) {
				return sendCodeRes;
			}
		} else {
			if (user.rememberMe) {
				const userTokenResult: any = await CustomEngine.createUserToken(result.data[0]._id);
				if (!userTokenResult || !userTokenResult.success) {
					return userTokenResult;
				}
				resultToRet['userToken'] = userTokenResult.data[0]._id;
			}
			const sessionResult: any = await CustomEngine.createSession(result.data[0]._id, '');
			if (!sessionResult || !sessionResult.success) {
				return sessionResult;
			}
			resultToRet['sid'] = sessionResult.data[0]._id;
			resultToRet['expiresOn'] = Utils.setExpiresOn(config.settingRecord.defaultSessionExpiration);
			resultToRet['isCodeRequired'] = false;
		}

		return result.data[0].isMFAEnabled ? Result.success(resultToRet, 'MFA required', StatusCode.success) :
			Result.success(resultToRet, 'User login successfully', StatusCode.success);
	}
	public static async getUserToken(verificationCodeId: any, code: any): Promise<Result> {
		if (!verificationCodeId || !code) {
			return !verificationCodeId ? Result.error(i18n.__('Auth.getUserToken.CodeIdMissing:verificationCodeId is missing'), '', StatusCode.badRequest) :
				Result.error(i18n.__('Auth.getUserToken.codeIsMissing:Code is missing'), '', StatusCode.badRequest);
		}
		const verificationCodeResult: any = await Database.query({
			objType: ObjectType.VERIFICATIONCODE,
			conditions: {
				_id: verificationCodeId,
				code: code
			}
		});
		if (!verificationCodeResult || !verificationCodeResult.success || verificationCodeResult.data.length === 0) {
			return (!verificationCodeResult || !verificationCodeResult.success) ? verificationCodeResult :
				Result.error(i18n.__('Auth.getUserToken.expiredOrInvalidCode:Entered code is invalid or expired'), '', StatusCode.badRequest);
		}
		const condition: any = {};
		if (verificationCodeResult.data[0].operationType === operationTypes.LOGIN) {
			condition['_id'] = verificationCodeResult.data[0].userId;
		} else {
			condition['email'] = verificationCodeResult.data[0].email;
		}
		const userResult: any = await Database.query({
			objType: ObjectType.USER,
			conditions: condition
		});
		if (!userResult || !userResult.success || userResult.data.length === 0) {
			return (!userResult || !userResult.success) ? userResult :
				Result.error(i18n.__('Auth.getUserToken.UserNotExists:User not found'), '', StatusCode.badRequest);
		}
		const userTokenResult: any = await CustomEngine.createUserToken(userResult.data[0]._id);
		if (!userTokenResult || !userTokenResult.success) {
			return userTokenResult;
		}
		let sessionId: any;
		if (userTokenResult.data[0]._id) {
			const sessionResult: any = await CustomEngine.createSession(userResult.data[0]._id, userTokenResult.data[0]._id);
			if (!sessionResult || !sessionResult.success) {
				return sessionResult;
			}
			if (sessionResult.data.length > 0) {
				sessionId = sessionResult.data[0]._id;
			}
		}
		// tslint:disable-next-line:max-line-length
		let response: any = {}
		response['sidExpiresOn'] = Utils.setExpiresOn(config.settingRecord.defaultSessionExpiration);
		response['userTokenExpiresOn'] = Utils.setExpiresOn(config.settingRecord.defaultUserTokenExpiration);
		response['userToken'] = userTokenResult.data[0]._id;
		response['sid'] = sessionId;
		return Result.success(response, 'UserToken created successfully', StatusCode.created);
	}
	public static async getSession(context: any): Promise<Result> {
		if (!context.uid || !context.userToken) {
			return !context.uid ? Result.error(i18n.__('Auth.getSession.userIdMissing:User id is missing'), '', StatusCode.badRequest) :
				Result.error(i18n.__('Auth.getSession.userTokenIdMissing:UserToken is missing'), '', StatusCode.badRequest);
		}
		const sessionResult: any = await CustomEngine.createSession(context.uid, context.userToken);
		if (!sessionResult || !sessionResult.success) {
			return sessionResult;
		}
		return Result.success({ sid: sessionResult.data[0]._id, expiresOn: Utils.setExpiresOn(config.settingRecord.defaultSessionExpiration) }, 'Session created successfully', StatusCode.created);
	}
	public static async logout(req: any): Promise<Result> {
		const auth: any = JSON.parse(req.headers.authorization);
		const recordsToDelete: any = [];
		if (auth.userToken) {
			const userTokenRes: any = await Database.query({
				objType: ObjectType.USERTOKEN,
				conditions: {
					_id: auth.userToken
				}
			});
			if (userTokenRes && userTokenRes.success && userTokenRes.data.length > 0) {
				userTokenRes.data.forEach((userToken: any) => {
					recordsToDelete.push(userToken);
				});
			}
		}
		const sessionCondition: any = {};
		sessionCondition['$or'] = [];
		auth.userToken ? sessionCondition['$or'].push({ userToken: auth.userToken }) : '';
		auth.sid ? sessionCondition['$or'].push({ _id: auth.sid }) : '';
		const sessionRes: any = await Database.query({
			objType: ObjectType.SESSION,
			conditions: sessionCondition
		});
		if (sessionRes && sessionRes.success && sessionRes.data.length > 0) {
			sessionRes.data.forEach((session: any) => {
				recordsToDelete.push(session);
			});
		}
		if (recordsToDelete.length > 0) {
			const deleteRes: any = await Database.delete(recordsToDelete);
			if (!deleteRes || !deleteRes.success) {
				return deleteRes;
			}
		}

		return Result.success('', 'User log out successfully', StatusCode.success);
	}
}

