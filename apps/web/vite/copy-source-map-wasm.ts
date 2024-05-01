import { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

let remixContext: any;

export function copySourceMapWasm(): Plugin {
  return {
    name: 'copy-source-map-wasm',
    configResolved(config) {
      const { __remixPluginContext } = config as any;
      remixContext = __remixPluginContext;
    },
    async closeBundle() {
      try {
        const destinationPath = path.join(
          remixContext.remixConfig.buildDirectory,
          'server/assets/mappings.wasm',
        );
        const sourceMapModuleUrl = new URL(await import.meta.resolve('source-map'));
        const sourceMapBasePath = path.dirname(fileURLToPath(sourceMapModuleUrl));

        const wasmFilePath = path.join(sourceMapBasePath, 'lib/mappings.wasm');

        fs.copyFileSync(wasmFilePath, destinationPath);
      } catch (error) {
        console.log('Error copying source-map wasm file', error);
      }
    },
  };
}
