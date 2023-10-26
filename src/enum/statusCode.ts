export enum StatusCode {
	success = 200,
	serverError = 500,
	invalidSession = 401,
	notFound = 404,
	badRequest = 400,
	created = 201,
	pending = 202,
	noContent = 204,
	insufficientAccess = 403,
	loginTimeout = 440
}
