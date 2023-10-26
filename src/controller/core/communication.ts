import fs from 'fs';
import path from 'path';
import { ErrorCode } from '../../enum/errorCode';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
import Util from './utility';
import Core from './core';
const rootDir = Util.rootDir();
const sgMail = require('@sendgrid/mail');

export default class Communication {
  public static async sendEmail(userNameToSend: any, subjectToSend: any, textToSend: any, codeToSend: any, event: string) {
	try {
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		let bodyTosend: any = (fs.readFileSync(path.join(rootDir, `templates/email/${event}.html`), 'utf8') as string);
		bodyTosend && typeof bodyTosend === 'string' && bodyTosend.includes('{{username}}') ? bodyTosend = bodyTosend.replace('{{username}}', userNameToSend) : '';
		bodyTosend && typeof bodyTosend === 'string' && bodyTosend.includes('{{code}}') ? bodyTosend = bodyTosend.replace('{{code}}', codeToSend) : '';
		const msgToSend = {
			to: userNameToSend,
			from: process.env.SENDGRID_FROM_EMAIL,
			subject: subjectToSend,
			text: textToSend,
			html: bodyTosend,
		};
		if (!Core.isTestMode) {
			const response = await sgMail.send(msgToSend);
		}
		return Result.success('', 'Message sent successfully', StatusCode.success, ErrorCode.none);
	} catch (error) {
		return Result.error(error);
	}
  }
}
