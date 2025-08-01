/// <reference types="vitest" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: false,
      exclude: ['**/*.spec.ts', '**/*.test.ts'],
      outDir: 'dist',
      entryRoot: 'lib',
      staticImport: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: './lib/index.ts',
        'ports/input': './lib/ports/input/index.ts',
        'ports/out': './lib/ports/out/index.ts',
        services: './lib/services/index.ts',
        di: './lib/di/index.ts',
        domain: './lib/domain/index.ts',
        'adapters/out': './lib/adapters/out/index.ts',
      },
      name: '@vecrea/oid4vc-verifier-frontend-core',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (entryName === 'index') {
          return `index.${format === 'es' ? 'mjs' : 'cjs'}`;
        }
        return `${entryName}/index.${format === 'es' ? 'mjs' : 'cjs'}`;
      },
    },
    rollupOptions: {
      external: ['mdoc-cbor-ts'],
      onwarn(warning, warn) {
        if (
          warning.code === 'CIRCULAR_DEPENDENCY' &&
          !warning.message.includes('node_modules')
        ) {
          console.warn('Circular dependency detected:', warning.message);
        }
        warn(warning);
      },
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'lib/**/index.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
});
