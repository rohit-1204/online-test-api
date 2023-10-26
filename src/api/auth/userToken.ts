import express, { Request, Response } from 'express';
import Auth from '../../controller/auth/auth';
import Result from '../../models/models';
export const router = express.Router();
export default router;

router.post('/auth/userToken', async function (req: Request, res: Response) {
	try {
		const result: Result = await Auth.getUserToken(req.body.verificationCodeId, req.body.code);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});
