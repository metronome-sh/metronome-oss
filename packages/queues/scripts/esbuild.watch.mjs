import { context } from 'esbuild';

import { esbuildConfig } from './esbuild.mjs';

const cjsContext = await context(esbuildConfig);

await cjsContext.rebuild();

await cjsContext.watch();
