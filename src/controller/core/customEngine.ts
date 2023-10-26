import config from '../../../config';
import { ObjectType } from '../../enum/objectType';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
import Database from './database';
import Utils from './utils';

export class CustomEngine {
	public static async createUserToken(userID: string) {
		const userToken: any = {
			objType: ObjectType.USERTOKEN,
			user: userID,
			expiresOn: Utils.setExpiresOn(config.settingRecord.defaultUserTokenExpiration), // for 1 month
		};
		const userTokenResult: any = await Database.save(userToken);
		if (!userTokenResult || !userTokenResult.success) {
			return userTokenResult;
		}
		return Result.success(userTokenResult.data, 'User token created successfully', StatusCode.created);
	}
	public static async createSession(userID: string, userTokenId: string) {
		let sessionResult: any;
		sessionResult = await Database.query({
			objType: ObjectType.SESSION,
			conditions: {
				user: userID,
				userToken: userTokenId
			}
		});
		if (sessionResult.data && sessionResult.data.length > 0) {
			sessionResult.data[0]['expiresOn'] = Utils.setExpiresOn(config.settingRecord.defaultSessionExpiration);
			sessionResult = await Database.update(sessionResult.data[0]);
		} else {
			const session: any = {
				objType: ObjectType.SESSION,
				user: userID,
				expiresOn: Utils.setExpiresOn(config.settingRecord.defaultSessionExpiration), // for 30min
				userToken: userTokenId
			};
			sessionResult = await Database.save(session);
		}
		if (!sessionResult || !sessionResult.success) {
			return sessionResult;
		}
		return Result.success(sessionResult.data, 'Session created successfully', StatusCode.created);
	}
}
