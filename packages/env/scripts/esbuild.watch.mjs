import { context } from 'esbuild';

import { esbuildConfig, cjsConfig } from './esbuild.mjs';

const [esmContext, cjsContext] = await Promise.all([context(esbuildConfig), context(cjsConfig)]);

await Promise.all([esmContext.rebuild(), cjsContext.rebuild()]);

await Promise.all([esmContext.watch(), cjsContext.watch()]);
