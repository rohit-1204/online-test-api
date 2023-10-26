import Result from '../../models/models';
import express, { Response, Request } from 'express';
import Verify from '../../controller/user/verification';
export const router = express.Router();
export default router;


router.post('/user/verify', async function (req: Request, res: Response) {
	try {
		let deleteOnVerify = false;
		const verification: any = { email: req.body.email, code: req.body.code, verificationCodeId: req.body.verificationCodeId };
		if (req.query && req.query.hasOwnProperty('deleteOnVerify')) {
			deleteOnVerify = JSON.parse(req.query.deleteOnVerify as string);
		}
		const result: Result = await Verify.validateVerificationCode(verification, deleteOnVerify);
		return res.json(result);
	} catch (error) {
		return res.json(Result.error(error.message));
	}
});
