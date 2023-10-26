import express, { Request, Response } from 'express';
import Auth from '../../controller/auth/auth';
import Authenticate from '../../controller/core/authenticate';
import Result from '../../models/models';
import { AuthenticateAction } from '../../enum/autheticateAction';
import { StatusCode } from '../../enum/statusCode';
export const router = express.Router();
export default router;

router.get('/auth/session', async function (req: Request, res: Response) {
	try {
		let result: Result = await Authenticate.authenticateUserToken(req);
		if (!result.success) {
			res.status(StatusCode.invalidSession);
			return res.json(result);
		}
		const context: any = result.data;
		result = await Auth.getSession(context);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});
