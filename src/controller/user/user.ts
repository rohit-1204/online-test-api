import i18n from 'i18n';
import config from '../../../config';
import { ErrorCode } from '../../enum/errorCode';
import { ObjectType } from '../../enum/objectType';
import { operationTypes } from '../../enum/operationTypes';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
import Communication from '../core/communication';
import { CustomEngine } from '../core/customEngine';
import Database from '../core/database';
import Utils from '../core/utils';
import Verify from './verification';
require('dotenv').config();

export default class User {

	code?: string;
	verificationCodeId?: string;
	userName?: string;
	password?: string;
	email?: string;
	salt?: string;
	objType?: string;
	isMFAEnabled?: true;
	salutation?: string;
	firstName?: string;
	lastName?: string;
	_id?: string;
	contactId?: string;
	codeInt?: any;

	public static async forgotPassword(body: any): Promise<Result> {
		body['email'] = body.userName ? body.userName : body.email;
		body['operationType'] = operationTypes.LOGIN;
		body['event'] = 'login';
		body['subject'] = 'Your Online Test verification code';
		body['text'] = 'Login';
		if (!body || !(Utils.getRegex('email').test(body.userName))) {
			return Result.error(i18n.__('User.forgotPassword.invalidUsername:Invalid username'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		return await this.sendCode(body);
	}

	public static async updatePassword(body: any): Promise<Result> {
		if (!body || Object.keys(body).length === 0) {
			return Result.error(i18n.__('User.updatePassword.bodyMissing:Body is missing'), '', StatusCode.badRequest, ErrorCode.bodyMissing);
		}
		if (!body.userName || !body.password) {
			return !body.userName ? Result.error(i18n.__('User.updatePassword.userNameMissing:User name is missing'), '', StatusCode.badRequest, ErrorCode.missingField) :
				Result.error(i18n.__('User.updatePassword.passwordMissing:Password is missing'), '', StatusCode.badRequest, ErrorCode.missingField);
		}
		if (!body.code || !body.verificationCodeId) {
			return !body.code ? Result.error(i18n.__('User.updatePassword.codeMissing:Code is missing'), '', StatusCode.badRequest, ErrorCode.missingField) :
				Result.error(i18n.__('User.updatePassword.verificationCodeIdMissing:VerificationCodeId is missing'), '', StatusCode.badRequest, ErrorCode.missingField);
		}

		if (body.password.length < config.settingRecord.minPasswordLength) {
			// tslint:disable-next-line:max-line-length
			return Result.error(i18n.__('User.updatePassword.wrongPasswordSize:Password should contain 8 characters and alphanumeric with a capital letter and special character'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		if (!new RegExp(config.settingRecord.passwordPattern).test(body.password)) {
			// tslint:disable-next-line:max-line-length
			return Result.error(i18n.__('User.updatePassword.wrongPasswordFormatEntered:Password should contain 8 characters and alphanumeric with a capital letter and special character'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		const userResult: any = await Database.query({ objType: ObjectType.USER, conditions: { email: body.userName } });
		if (!userResult || !userResult.success || (userResult && userResult.data.length === 0)) {
			return Result.error(i18n.__('User.updatePassword.invalidUsername:User not found'), '', StatusCode.notFound, ErrorCode.notFound);
		}
		if (userResult.data[0].password && userResult.data[0].password === Utils.sha256(body.password, userResult.data[0].salt)) {
			return Result.error(i18n.__('User.updatePassword.old&newPasswordCantSame:New password cannot be the same as the old password'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		body['email'] = body.userName;
		const codeVerifyRes: any = await Verify.validateVerificationCode(body, false);
		if (!codeVerifyRes || !codeVerifyRes.success) {
			return codeVerifyRes;
		}
		// update password
		userResult.data[0].salt = Utils.generateSalt();
		userResult.data[0].password = Utils.sha256(body.password as string, userResult.data[0].salt);
		const updateRes: any = await Database.update(userResult.data[0]);
		if (!updateRes || !updateRes.success) {
			return updateRes;
		}
		return Result.success('', i18n.__('Password updated successfully'), StatusCode.success, ErrorCode.none);
	}
	public static async changePassword(body: any, context: any): Promise<Result> {
		if (!body || Object.keys(body).length === 0 || !context || Object.keys(context).length === 0) {
			return (!body || Object.keys(body).length === 0) ? Result.error(i18n.__('User.changePassword.bodyMissing:Body is missing'), '', StatusCode.badRequest, ErrorCode.bodyMissing) :
				Result.error(i18n.__('User.changePassword.contextMissing:Context is missing'), '', StatusCode.badRequest, ErrorCode.missingField);
		}
		if (!body.oldPassword || !body.newPassword) {
			return !body.oldPassword ? Result.error(i18n.__('User.changePassword.oldPasswordMissing:Please provide old password'), '', StatusCode.badRequest, ErrorCode.missingField) :
				Result.error(i18n.__('User.changePassword.newPasswordMissing:Please provide new password'), '', StatusCode.badRequest, ErrorCode.missingField);
		}
		if (body.newPassword.length < config.settingRecord.minPasswordLength) {
			// tslint:disable-next-line:max-line-length
			return Result.error(i18n.__('User.changePassword.wrongPasswordSize:Password should contain 8 characters and alphanumeric with a capital letter and special character'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		if (!new RegExp(config.settingRecord.passwordPattern).test(body.newPassword)) {
			// tslint:disable-next-line:max-line-length
			return Result.error(i18n.__('User.changePassword.wrongPasswordFormatEntered:Password should contain 8 characters and alphanumeric with a capital letter and special character'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		// validate old password
		if (context.user && context.user.password && context.user.password !== Utils.sha256(body.oldPassword, context.user.salt)) {
			return Result.error(i18n.__('User.changePassword.invalidOldPassword:Provided old password is invalid'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		if (body.oldPassword === body.newPassword) {
			return Result.error(i18n.__('User.changePassword.old&newPasswordCantSame:New password cannot be the same as the old password'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		// update password
		const updatedRecordToSave: any = {};
		updatedRecordToSave['objType'] = ObjectType.USER;
		updatedRecordToSave['_id'] = context.user._id;
		updatedRecordToSave['salt'] = Utils.generateSalt();
		updatedRecordToSave['password'] = Utils.sha256(body.newPassword as string, updatedRecordToSave['salt']);
		const updateRes: any = await Database.update(updatedRecordToSave);
		if (!updateRes || !updateRes.success) {
			return updateRes;
		}
		return Result.success('', i18n.__('Password changed successfully'), StatusCode.success, ErrorCode.none);
	}



	public static async getUserInfo(context: any): Promise<Result> {
		if (!context || (context && (!context.user || Object.keys(context.user).length === 0))) {
			return Result.error(i18n.__('User.getUserInfo.UserNotFound:User not found'), '', StatusCode.notFound, ErrorCode.notFound);
		}
		// get user(contact) details from salesforce
		const salesforceRes = {}

		return Result.success(salesforceRes, 'User details fetched successfully', StatusCode.success, ErrorCode.none);
	}

	public static async updateUserInfo(userContactToUpdate: any, context: any): Promise<Result> {
		if (!context || (context && (!context.user || Object.keys(context.user).length === 0))) {
			return Result.error(i18n.__('User.getUserInfo.UserNotFound:User not found'), '', StatusCode.notFound, ErrorCode.notFound);
		}
		const invalidFieldsToUpdate: any = [];
		Object.keys(userContactToUpdate).forEach((fieldToUpdate: any) => {
			config.userFieldsNotToUpdate.includes(fieldToUpdate) ? invalidFieldsToUpdate.push(fieldToUpdate) : '';
		});
		if (invalidFieldsToUpdate.length > 0) {
			// tslint:disable-next-line:max-line-length
			return Result.error(i18n.__('User.updateUserInfo.invalidFieldsToUpdate:Invalid fields [%s] provided for update', invalidFieldsToUpdate.join(', ')), '', StatusCode.badRequest, ErrorCode.notUpdatable);
		}
		// update user(contact) details from salesforce

		return Result.success({ _id: 123 }, 'User updated successfully', StatusCode.success, ErrorCode.none);
	}

	public static async registerUser(user: User): Promise<Result> {

		user.userName ? user['email'] = user.userName : '';
		if (!user.password) {
			return Result.error(i18n.__('User.registerUser.missingIsPassword:Please enter password'), '', StatusCode.badRequest, ErrorCode.missingField);
		}
		if (user.password.length < config.settingRecord.minPasswordLength) {
			// tslint:disable-next-line:max-line-length
			return Result.error(i18n.__('User.registerUser.wrongPasswordSize:Password should contain 8 characters and alphanumeric with a capital letter and special character'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		const passwordPattern = new RegExp(config.settingRecord.passwordPattern);
		if (!passwordPattern.test(user.password)) {
			// tslint:disable-next-line:max-line-length
			return Result.error(i18n.__('User.registerUser.wrongPasswordFormatEntered:Password should contain 8 characters and alphanumeric with a capital letter and special character'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}

		try {
			this.prepareUser(user);

			const result = await Database.save(user);
			if (!result.success) {
				return result;
			}
			user._id = result.data[0]._id;
			const response: any = {};
			const userTokenResult = await CustomEngine.createUserToken(user._id as string);
			const sessionResult = await CustomEngine.createSession(user._id as string, userTokenResult.data[0]._id);
			if (!sessionResult.success) {
				return sessionResult;
			}
			response['sidExpiresOn'] = Utils.setExpiresOn(config.settingRecord.defaultSessionExpiration);
			response['userTokenExpiresOn'] = Utils.setExpiresOn(config.settingRecord.defaultUserTokenExpiration);
			response['userToken'] = userTokenResult.data[0]._id;
			response['sid'] = sessionResult.data[0]._id;
			return Result.success(response, i18n.__('User registered successfully'), StatusCode.success);
		} catch (error) {
			return Result.error(error);
		}
	}

	static prepareUser(user: User) {
		user.salt = Utils.generateSalt();
		user.password = Utils.sha256(user.password as string, user.salt);
		user.objType = 'user';
	}

	static async sendCode(body: any): Promise<Result> {
		if (!body.email) {
			return Result.error(i18n.__('User.sendCode.sendCodeForUser:Please enter email'), '', StatusCode.badRequest, ErrorCode.missingField);
		}
		const query: any = {
			objType: ObjectType.VERIFICATIONCODE,
			conditions: {
				operationType: body.operationType,
				email: body.email,
				expiresOn: { $gt: new Date() }
			}
		};
		let result = await Database.query(query);
		if (!result || !result.success) {
			return result;
		}
		const dataToSend: any = {
			userName: body.email,
			event: body.event,
			subject: body.subject,
			text: body.text
		};
		if (result.success && result.data.length > 0 && result.data[0]['code'] && result.data[0]['expiresOn'] > new Date()) {
			dataToSend['code'] = result.data[0]['code'];
		} else {
			// query user to get its id
			const userQuery: any = {
				objType: ObjectType.USER,
				conditions: {
					$or: [
						{ email: body.email },
						{ userName: body.email }
					]
				}
			};
			let userResult = await Database.query(userQuery);
			if (!userResult || !userResult.success) {
				return userResult;
			}
			const codeToSend = Utils.getVerificationCode('Phone');
			const codeToSave: any = {
				objType: ObjectType.VERIFICATIONCODE,
				code: codeToSend,
				email: body.email,
				operationType: body.operationType ? body.operationType : operationTypes.REGISTER,
				expiresOn: Utils.setExpiresOn(config.settingRecord.verificationCodeExpiresIn)
			};
			userResult.data.length > 0 && userResult.data[0]._id ? codeToSave['userId'] = userResult.data[0]._id : ''
			result = await Database.save(codeToSave);
			if (!result || !result.success) {
				return result;
			}
			dataToSend['code'] = codeToSend;
		}
		const sentRes: any = await this.sendCodeForUser(dataToSend);
		if (!sentRes || !sentRes.success) {
			return sentRes;
		}
		return Result.success({ verificationCodeId: result.data[0]._id }, i18n.__('Code sent successfully'), StatusCode.success);
	}
	static async sendCodeForUser(dataToSend: any): Promise<Result> {
		return await Communication.sendEmail(dataToSend.userName, dataToSend.subject, dataToSend.text, dataToSend.code, dataToSend.event);
	}
}

