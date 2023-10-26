import express, { Response, Request } from 'express';
import Result from '../../models/models';
import User from '../../controller/user/user';
import { operationTypes } from '../../enum/operationTypes';
export const router = express.Router();
export default router;

router.post('/auth/sendCode', async function (req: Request, res: Response) {
	try {
		const body = {
			email: req.body.email,
			operationType: req.body.operationType?req.body.operationType:operationTypes.REGISTER,
			event: req.body.event?req.body.event:'register',
			subject: req.body.subject?req.body.subject:'Welcome to Online Test!',
			text: 'OTP'
		};
		const result: Result = await User.sendCode(body);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});
