import express, { Request, Response } from 'express';
import Authenticate from '../../controller/core/authenticate';
import User from '../../controller/user/user';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
export const router = express.Router();
export default router;


router.get('/user/userInfo', async function (req: Request, res: Response) {
	try {
		let result: Result = await Authenticate.authenticateSession(req);
		if (!result.success) {
			res.status(StatusCode.invalidSession);
			return res.json(result);
		}

		const context: any = result.data;
		result = await User.getUserInfo(context);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});

router.put('/user/userinfo', async function (req: Request, res: Response) {
	try {
		let result: Result = await Authenticate.authenticateSession(req);
		if (!result.success) {
			res.status(StatusCode.invalidSession);
			return res.json(result);
		}
		const context: any = result.data;
		result = await User.updateUserInfo(req.body, context);
		return res.json(result);
	} catch (error) {
		res.json(Result.error(error.message));
	}
});
