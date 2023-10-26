import { Request } from 'express';
import i18n from 'i18n';
import { ErrorCode } from '../../enum/errorCode';
import { ObjectType } from '../../enum/objectType';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
import Database from './database';
require('dotenv').config();

export default class Authenticate {

	public static async authenticateSession(req: Request): Promise<Result> {
		const header: any = req.headers.authorization;
		let auth = JSON.parse(header);
		typeof auth === 'number' ? auth = { sid: header } : '';
		if (!auth.sid || typeof auth.sid !== 'string') {
			return (!auth.sid) ?
				Result.error(i18n.__('Authenticate.authenticatesid.sidMissing:Please send sid to authenticate'), '', StatusCode.badRequest, ErrorCode.missingField) :
				Result.error(i18n.__('Authenticate.authenticatesid.invalidsidFormat:Please send sid in correct format'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		let context: any;
		const sessionCondition = {
			objType: ObjectType.SESSION,
			conditions: {
				$and: [
					{ _id: auth.sid },
					{ expiresOn: { $gt: new Date() } }
				]
			}
		};
		const sessionResult: any = await Database.query(sessionCondition);
		if (!sessionResult.success || sessionResult.data.length === 0) {
			return Result.error(i18n.__('Authenticate.authenticateSession.sessionExpired:Session expired'), '', StatusCode.invalidSession, ErrorCode.invalidAuthentication);
		}
		if (sessionResult.success && sessionResult.data.length > 0) {
			const resultUser: any = await Database.query({
				objType: ObjectType.USER,
				conditions: {
					_id: sessionResult.data[0].user
				}
			});
			const session: any = sessionResult.data[0]._id;
			const user: any = resultUser.data[0];
			context = {
				sid: session,
				uid: sessionResult.data[0].user,
				user: user,
			};
			context['userToken'] = sessionResult.data[0].userToken;
			return Result.success(JSON.parse(JSON.stringify(context)), i18n.__('User session authenticated successfully'), StatusCode.success);
		}
		// tslint:disable-next-line:max-line-length
		return Result.error(i18n.__('Authenticate.authenticateSession.expiredSid:Session expired'), '', StatusCode.invalidSession, ErrorCode.invalidAuthentication);
	}

	public static async authenticateUserToken(req: Request): Promise<Result> {

		const header: any = req.headers.authorization;
		let auth = JSON.parse(header);
		typeof auth === 'number' ? auth = { userToken: header } : '';
		if (!auth.userToken || typeof auth.userToken !== 'string') {
			return (!auth.userToken) ?
				Result.error(i18n.__('Authenticate.authenticateUserToken.userTokenMissing:Please send userToken to authenticate'), '', StatusCode.badRequest, ErrorCode.missingField) :
				Result.error(i18n.__('Authenticate.authenticateUserToken.invalidUserTokenFormat:Please send userToken in correct format'), '', StatusCode.badRequest, ErrorCode.invalidData);
		}
		let context: any;
		const result: any = await Database.query({
			objType: ObjectType.USERTOKEN,
			conditions: {
				_id: auth.userToken,
				expiresOn: { $gt: new Date() }
			}
		});

		if (!result.success || result.data.length === 0) {
			return Result.error(i18n.__('Authenticate.authenticateUserToken.expiredUserToken:User token expired'), '', StatusCode.invalidSession, ErrorCode.unauthorized);
		}
		if (result.success && result.data.length > 0) {
			const resultUser: any = await Database.query({
				objType: ObjectType.USER,
				conditions: {
					_id: result.data[0].user
				}
			});
			const token: any = result.data[0];
			const user: any = resultUser.data[0];
			context = {
				userToken: token._id,
				uid: token.user,
				user: user
			};
			return Result.success(JSON.parse(JSON.stringify(context)), i18n.__('User token authenticated successfully'), StatusCode.success);
		}
		// tslint:disable-next-line:max-line-length
		return Result.error(i18n.__('Authenticate.authenticateUserToken.expiredUserTokenId:User token expired'), '', StatusCode.invalidSession, ErrorCode.unauthorized);
	}

}

