import { config as svelteConfig } from '@repo/eslint-config/svelte';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import localSvelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default [
	includeIgnoreFile(gitignorePath),
	...svelteConfig,
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				svelteConfig: localSvelteConfig
			}
		}
	}
];
