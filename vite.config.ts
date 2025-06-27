/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'adapters/out/http': './lib/adapters/out/http/index.ts',
        'adapters/out/session': './lib/adapters/out/session/index.ts',
        di: './lib/di/index.ts',
        services: './lib/services/index.ts',
        utils: './lib/utils/index.ts',
        'ports/input': './lib/ports/input/index.ts',
        'ports/out/http': './lib/ports/out/http/index.ts',
        'ports/out/session': './lib/ports/out/session/index.ts',
      },
      formats: ['es', 'cjs'],
      name: 'oid4vc-verifier-frontend-core',
      fileName: (format, entry) => {
        const ext = format === 'es' ? 'js' : format;
        const indexFile = `index.${ext}`;

        return entry === 'main' ? indexFile : `${entry}/${indexFile}`;
        //return `${dir}/index.${ext}`;
      },
    },
  },
  test: {
    globals: true,
    include: ['./lib/**/*.test.ts', './lib/**/*.spec.ts'],
  },
});
