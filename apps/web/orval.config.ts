import { defineConfig } from 'orval';

export default defineConfig({
	api: {
		input: {
			target: './openapi.json'
		},
		output: {
			mode: 'split',
			target: './src/lib/api/generated/api.ts',
			schemas: './src/lib/api/generated/types/',
			clean: true,
			prettier: true,
			override: {
				mutator: {
					path: './src/lib/api/mutator.ts',
					name: 'customInstance'
				},
				enumGenerationType: 'union'
			}
		}
	}
});
