import path from 'path';
class Util {

	private static _rootDir: string = '';

	public static rootDir() {

		if (Util._rootDir) {
			return Util._rootDir;
		}

		if (path.dirname(__dirname).endsWith('dist')) {
			return path.resolve(__dirname + './../../');
		}

		return path.resolve(__dirname + './../../');
	}

}
export default Util;
