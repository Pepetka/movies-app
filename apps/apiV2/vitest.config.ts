import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  oxc: false,
  test: {
    clearMocks: true,
    restoreMocks: true,
    sequence: { hooks: 'stack' },
    pool: 'threads',
    slowTestThreshold: 200,
    // TODO: Add ci reports
    reporters: ['default', ['junit', { outputFile: './coverage/junit.xml' }]],
    silent: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Build artifacts
        '**/dist/**',
        '**/node_modules/**',
        '**/coverage/**',

        // Test files
        '**/*.spec.ts',
        '**/*.test-utils.ts',

        // NestJS boilerplate
        '**/*.module.ts',
        '**/*.schema.ts',
        '**/*.interface.ts',
        '**/*.config.ts',
        '**/*.dto.ts',
        '**/*.constants.ts',
        'src/main.ts',
        'src/app.module.ts',

        // Re-exports and types
        '**/index.ts',
        '**/*.d.ts',
        '**/types/**',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
        'src/modules/**/use-cases/**/*.ts': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90,
        },
        'src/modules/**/domain/**/*.ts': {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95,
        },
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.e2e-spec.ts'],
          environment: 'node',
          setupFiles: ['test/config/setup.ts'],
          hookTimeout: 30000,
          testTimeout: 15000,
          fileParallelism: false,
        },
      },
    ],
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true,
        },
      },
    }),
  ],
});
