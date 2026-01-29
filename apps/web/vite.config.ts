import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [sveltekit()],
		define: {
			__API_URL__: JSON.stringify(env.API_URL),
			__IS_PROD__: JSON.stringify(mode === 'production')
		}
	};
});
