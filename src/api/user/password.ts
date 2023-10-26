import Result from '../../models/models';
import express, { Response, Request } from 'express';
import User from '../../controller/user/user';
import Authenticate from '../../controller/core/authenticate';
import { StatusCode } from '../../enum/statusCode';
export const router = express.Router();
export default router;


router.post('/user/forgotPassword', async function (req: Request, res: Response) {
	try {
		const result: Result = await User.forgotPassword(req.body);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});

router.post('/user/updatePassword', async function (req: Request, res: Response) {
	try {
		const result: Result = await User.updatePassword(req.body);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});

router.post('/user/changePassword', async function (req: Request, res: Response) {
	try {
		let result: Result = await Authenticate.authenticateSession(req);
		if (!result.success) {
			res.status(StatusCode.invalidSession);
			return res.json(result);
		}
		const context: any = result.data;
		result = await User.changePassword(req.body, context);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});
