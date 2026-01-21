import { config as svelteConfig } from '@repo/eslint-config/svelte';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default [includeIgnoreFile(gitignorePath), ...svelteConfig];
