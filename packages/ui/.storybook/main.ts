import type { StorybookConfig } from '@storybook/sveltekit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

function getAbsolutePath(value: string) {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	addons: [getAbsolutePath('@storybook/addon-svelte-csf')],
	framework: getAbsolutePath('@storybook/sveltekit')
};
export default config;
