import Result from '../../models/models';
import express, { Response, Request } from 'express';
import User from '../../controller/user/user';
export const router = express.Router();
export default router;

router.get('/user/emailExists', async function (req: Request, res: Response) {
	try {
		const email: any = req.query.email;
		// const result: Result = await User.checkEmailExists(email);
		return res.json('result');
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});
