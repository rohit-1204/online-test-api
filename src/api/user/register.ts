import express, { Request, Response } from 'express';
import i18n from 'i18n';
import User from '../../controller/user/user';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
export const router = express.Router();
export default router;

router.post('/user/register', async function (req: Request, res: Response) {
	try {
		if (req.body && req.body.user) {
			const user: User = req.body.user;
			const result: Result = await User.registerUser(user);
			return res.json(result);
		}
		return res.json(Result.error(i18n.__('Please provide user and contact'), '', StatusCode.badRequest));

	} catch (error) {
		return res.json(Result.error(error.message));
	}
});
