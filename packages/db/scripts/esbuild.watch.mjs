import { context } from 'esbuild';

import { esbuildConfig } from './esbuild.mjs';

const esContext = await context(esbuildConfig);

await esContext.rebuild();

await esContext.watch();
