import i18n from 'i18n';
import { MongoClient, ObjectId } from 'mongodb';
import { StatusCode } from '../../enum/statusCode';
import Result from '../../models/models';
import Core from './core';
import { ErrorCode } from '../../enum/errorCode';
export default class Database {
	public static db: any;
	static mapDB: any = {};
	static async connect() {
		try {
			const connectionString = String(process.env.DB_CONNECTION_STRING);
			if (!Database.db) {
				const con = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
				Database.db = con.db();
				console.log('db connection : true');
				return Result.success('', 'Database connected successfully');
			} else {
				return Result.success('', 'Database connected allready');
			}

		} catch (ex) {
			return Result.error(ex);
		}
	}

	static async query(query: any) {
		let response: any;
		response = await Database.db.collection(query.objType).find(query.conditions).toArray();
		return Result.success(response, 'Record fetched successfully', StatusCode.success, ErrorCode.none);
	}

	static async save(records: any) {
		try {
			if (!Array.isArray(records)) {
				records = [records];
			}
			const mapRecords: any = {};
			for (const record of records) {
				record['isTestRecord'] = Core.isTestMode ? true : false;
				record['createdOn'] = new Date();
				record['modifiedOn'] = new Date();
				if (!record['_id']) {
					record['_id'] = await Database.getIdForRecord();
				}
				if (!mapRecords.hasOwnProperty(record.objType)) {
					mapRecords[record.objType] = [];
				}
				mapRecords[record.objType].push(record);
			}
			for (const objType of Object.keys(mapRecords)) {
				const response = await Database.db.collection(objType, { readPreference: 'primary' }).insertMany(mapRecords[objType]);
			}
			const responseToSend: any = [];
			records.forEach((record: any) => {
				record._id ? responseToSend.push({ _id: record._id }) : '';
			});
			return Result.success(responseToSend, 'Record created successfully', StatusCode.success);
		} catch (error) {
			return Result.error(error.message, error, StatusCode.badRequest, ErrorCode.invalidData);
		}
	}
	static async update(records: any) {
		if (!Array.isArray(records)) {
			records = [records];
		}
		const mapRecords: any = {};
		for (const record of records) {
			record['modifiedOn'] = new Date();
			if (!record['_id']) {
				return Result.error('Please provide record id to update', '', StatusCode.badRequest, ErrorCode.missingField);
			}
			if (!record['objType']) {
				return Result.error('Please provide record objType to update', '', StatusCode.badRequest, ErrorCode.missingField);
			}
			if (!mapRecords.hasOwnProperty(record.objType)) {
				mapRecords[record.objType] = [];
			}
			mapRecords[record.objType].push(record);
		}
		for (const objType of Object.keys(mapRecords)) {
			for (const record of mapRecords[objType]) {
				const response = await Database.db.collection(objType, { readPreference: 'primary' }).updateOne({ _id: record._id }, {
					$set: record
				});
			}
		}
		const responseToSend: any = [];
		records.forEach((record: any) => {
			record._id ? responseToSend.push({ _id: record._id }) : '';
		});
		return Result.success(responseToSend, 'Record updated successfully', StatusCode.success);
	}
	static async delete(records: any) {
		if (!Array.isArray(records)) {
			records = [records];
		}
		let missingId = false;
		let missingObjType = false;
		for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
			if (!records[recordIndex]['objType']) {
				missingObjType = true;
			}
			if (!records[recordIndex]['_id']) {
				missingId = true;
			}
		}
		if (missingId || missingObjType) {
			return missingId ? Result.error(i18n.__('Database.delete.missingId:Please provide record id to delete'), '', StatusCode.badRequest) :
				Result.error(i18n.__('Database.delete.missingObjType:Please provide objType to delete record'), '', StatusCode.badRequest);
		}
		let response: any;
		for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
			response = await Database.db.collection(records[recordIndex]['objType']).deleteOne({ _id: records[recordIndex]['_id'] });
		}
		return Result.success('', 'Records deleted successfully', StatusCode.success);
	}
	public static async getIdForRecord() {
		return new ObjectId().toString();
	}
	static async close() {
		try {
			if (Database.db) {
				await Database.db.close();
				return Result.success(null, i18n.__(`Database collection close`));
			}
		} catch (ex) {
			return Result.error(ex);
		}
	}
}

