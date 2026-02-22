import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		typescript: {
			config: (cfg) => {
				cfg.include.push('../.storybook/**/*.ts');
			}
		}
	}
};

export default config;
