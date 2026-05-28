// @ts-check
import { config as nestConfig } from '@repo/eslint-config/nest';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  ...nestConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
