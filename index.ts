import Core from './src/controller/core/core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import i18n from 'i18n';
import path from 'path';
import MainUtil from './src/controller/mainUtil';
import Util from './src/controller/core/utility';
export let app: any = express();
require('dotenv').config();
const apiVersion = require('./version.json');
const os = require('os');
const router = express.Router();

app.get('/', (req: any, res: any) => {
	const result: any = {
		name: 'online-quiz-api',
		version: apiVersion.version,
		apiStartedAt: apiVersion.startedAt,
		host: os.hostname()
	};
	res.send(JSON.stringify(result));
});
class App {
	static isTestMode: boolean = false;
	static isAppStarted: boolean = false;
	public static async start(isTestMode: any = false) {
		if (App.isAppStarted) {
			return;
		}
		App.isTestMode = isTestMode;
		let result: any = {};
		App.enableCORS();
		const rootDirFori118 = MainUtil.rootDir();
		const rootDir = Util.rootDir();
		i18n.configure({
			defaultLocale: 'en',
			directory: path.join(rootDirFori118, 'locales'),
			register: global,
			objectNotation: true
		});
		result = Core.loadAPIRoutes(app, rootDir, 'api/user');
		if (!result.success) {
			return result;
		}

		result = Core.loadAPIRoutes(app, rootDir, 'api/auth');
		if (!result.success) {
			return result;
		}

		result = Core.loadAPIRoutes(app, rootDir, 'api/company');
		if (!result.success) {
			return result;
		}

		result = Core.loadAPIRoutes(app, rootDir, 'api/document');
		if (!result.success) {
			return result;
		}

		result = Core.loadAPIRoutes(app, rootDir, 'api/trade');
		if (!result.success) {
			return result;
		}

		result = Core.loadAPIRoutes(app, rootDir, 'api/shipment');
		if (!result.success) {
			return result;
		}

		result = Core.loadAPIRoutes(app, rootDir, 'api/bol');
		if (!result.success) {
			return result;
		}

		result = await Core.start(isTestMode);
		if (!result.success) {
			return result;
		}
		result = await Core.init(isTestMode);
		if (!result.success) {
			return result;
		}
		console.log(result.message);
		const server = await app.listen(process.env.PORT);
		server.timeout = 240000;
		apiVersion.startedAt = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
			console.log(`online-quiz-api running on port : ${process.env.PORT} ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
		App.isAppStarted = true;
	}

	public static enableCORS() {
		app.options('*', cors());
		app.use(function (req: any, res: any, next: any) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
			res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
			res.header('Access-Control-Allow-Methods', 'Content-Type, Authorization');
			next();
		});
		app.use(express.json({ limit: '200mb' }));
		app.use(express.urlencoded({
			extended: true,
			limit: '200mb'
		}));
		app.use(cookieParser());
		app.use(express.static(path.join(__dirname, 'public')));

		app.use('/.netlify/functions/api',router)
	}
}
export default App;
