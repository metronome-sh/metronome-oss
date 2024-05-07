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
};

await build(esbuildConfig);
