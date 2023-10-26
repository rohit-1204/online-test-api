import express, { Request, Response } from 'express';
import Auth from '../../controller/auth/auth';
import Result from '../../models/models';
export const router = express.Router();
export default router;

router.get('/auth/logout', async function (req: Request, res: Response) {
	try {
		const result: Result = await Auth.logout(req);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});
