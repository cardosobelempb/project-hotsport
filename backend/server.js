// Minimal CJS wrapper — delegates to the TypeScript entry point.
// Run directly with: node --import tsx/esm server.ts
// or via the npm scripts: npm run dev:legacy / npm start:legacy
require('tsx/cjs');
require('./server.ts');
