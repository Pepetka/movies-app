import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const isProd = mode === 'production';

	return {
		plugins: [sveltekit()],
		server: {
			proxy: isProd
				? undefined
				: {
						'/api': {
							target: env.API_URL,
							changeOrigin: true
						}
					}
		},
		define: {
			__API_URL__: JSON.stringify(isProd ? env.API_URL : ''),
			__IS_PROD__: JSON.stringify(isProd)
		}
	};
});
