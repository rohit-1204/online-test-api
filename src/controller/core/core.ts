import fs from 'fs';
import path from 'path';
import i18n from 'i18n';
import { ErrorCode } from '../../enum/errorCode';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
import Database from './database';
import Util from './utility';

export default class Core {

	public static isTestMode: any;
	public static isInit: any;
	public static config: any;
	static _moduleRegExp: any = new RegExp('^([^.]+).(ts|js)$');
	public static async init(isTestMode: boolean = false) {
		Core.isTestMode = isTestMode;
		Core.isInit = true;
		return await Core.createDbCollections();
	}
	public static async start(isTestMode: boolean = false, isInit: any = false) {
		Core.isTestMode = isTestMode;
		Core.isInit = isInit;
		const result: any = await Database.connect();
		if (!result.success) {
			return result;
		}
		return Result.success(null);
	}

	public static async stop() {
		return await Database.close();
	}
	public static loadAPIRoutes(app: any, rootDir: string, entryPath: string, wildCardParameter?: any) {
		// api controller routes
		try {
			const apiDir: string = path.join(rootDir, entryPath);
			if (fs.existsSync(apiDir)) {
				const subDir = fs.readdirSync(apiDir);
				subDir.forEach(function (dir: any) {
					const subDirPath = path.join(apiDir, dir);
					if (fs.statSync(subDirPath).isDirectory()) {
						Core.createPath(app, subDirPath, wildCardParameter);
					} else {
						if (Core._moduleRegExp.test(dir)) {
							const parts = dir.match(Core._moduleRegExp);
							const apiname = (parts) ? parts[1] : '';
							const api_path = path.join(apiDir, apiname);
							const controller = require(api_path);
							app.use(wildCardParameter ? wildCardParameter : '/', controller.default);
						}
					}
				});
			}
			return Result.success(null,  'API routing is done successfully');
		} catch (ex) {
			return Result.error(i18n.__('Internal server error'), ex, StatusCode.serverError, ErrorCode.none);
		}

	}
	public static createPath(app: any, parent: string, wildCardParameter?: any) {

		const apiFiles = fs.readdirSync(parent);
		apiFiles.forEach(function (api: string) {
			const subDirPath = path.join(parent, api);
			if (fs.statSync(subDirPath).isDirectory()) {
				Core.createPath(app, subDirPath, wildCardParameter);
			} else {
				if (Core._moduleRegExp.test(api)) {
					const parts = api.match(Core._moduleRegExp);
					const apiname = (parts) ? parts[1] : '';
					const api_path = path.join(parent, apiname);
					const controller = require(api_path);
					app.use(wildCardParameter ? wildCardParameter : '/', controller.default);
				}
			}
		});
	}
	public static async createDbCollections() {
		const expectedResult: any = await Core.getAllFileSystemObjects();
		if (!expectedResult || !expectedResult.success) {
			return expectedResult;
		}
		let result: any;
		for (const obj of Object.keys(expectedResult.data.mapOfObjectSchema)) {
			const validationSchemaObj = await Core.getSchemaValidationObj(expectedResult.data.mapOfObjectSchema[obj]);
			result = await Database.db.createCollection(obj, { validator: {$jsonSchema: validationSchemaObj} });
		}
		return Result.success('', 'Collections created successfully');
	}
	public static async getSchemaValidationObj(collections: any) {
		const properties: any = {};
		const requiredFields: any = [];
		for (const field of Object.keys(collections.fields)) {
			properties[collections.fields[field].name] = {
				bsonType: collections.fields[field].type,
				description: collections.fields[field].label
			};
			collections.fields[field].hasOwnProperty('required') && collections.fields[field].required ? requiredFields.push(collections.fields[field].name) : '';
		}
		const objToReturn: any = {
			bsonType: 'object',
			title: collections.name,
			required: requiredFields,
			properties: properties
		};
		return objToReturn;
	}
	public static async getAllFileSystemObjects() {
		try {
			const mapOfObjectSchema: any = {};
			const dirToRead: string = path.join(Util.rootDir(), 'object/schema');
			const apiFiles = fs.readdirSync(dirToRead);

			for (const file of apiFiles) {
				const object = require(path.join(dirToRead, file));
				const objName = object.schema.name;
				mapOfObjectSchema[`${objName}`] = object.schema;
			}
			return Result.success({ mapOfObjectSchema: mapOfObjectSchema });

		} catch (e) {
			return Result.error(i18n.__('Internal server error'), e, StatusCode.serverError, ErrorCode.none);
		}
	}
}
