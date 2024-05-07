import { build } from 'esbuild';

/**
 * @type {import('esbuild').BuildOptions}
 */
export const esbuildConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  packages: 'external',
  plugins: [],
  platform: 'node',
  format: 'esm',
  outfile: 'dist/index.server.js',
  logLevel: 'info',
  treeShaking: true,
};

export const cjsConfig = {
  ...esbuildConfig,
  format: 'cjs',
  outfile: 'dist/index.server.cjs',
};

await Promise.all([build(esbuildConfig), build(cjsConfig)]);
