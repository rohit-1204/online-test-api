import path from 'path';

class MainUtil {

	private static _rootDir: string = '';

	public static rootDir() {

		if (MainUtil._rootDir) {
			return MainUtil._rootDir;
		}

		if (path.dirname(__dirname).endsWith('dist')) {
			return path.resolve(__dirname + './../../');
		}

		return path.resolve(__dirname + './../../');
	}

}
export default MainUtil;
