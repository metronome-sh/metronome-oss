import fs from 'fs';
import path from 'path';

export const getDocumentsPath = () => {
  const cwd = process.cwd();

  const packageJson = JSON.parse(fs.readFileSync(path.resolve(cwd, 'package.json'), 'utf-8'));

  const appDir = packageJson.imports['#app/*'];

  const docsPath = path.resolve(cwd, appDir.replace('*', '/routes/docs/documents'));

  return docsPath;
};
