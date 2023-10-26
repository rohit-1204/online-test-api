import shell from 'shelljs';
shell.cp('-R', 'version.json', 'dist/version.json');
shell.cp('-R', 'locales', 'dist/locales');
