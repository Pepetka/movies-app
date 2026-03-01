import type { Preview } from '@storybook/sveltekit';

import { SideBySideDecorator, ThemeDecorator } from '$lib/storybook/decorators';

import '$lib/styles/bundle.css';

const preview: Preview = {
	globalTypes: {
		theme: {
			description: 'Global theme for components',
			toolbar: {
				title: 'Theme',
				icon: 'circlehollow',
				items: [
					{
						value: 'light',
						icon: 'sun',
						title: 'Light'
					},
					{
						value: 'dark',
						icon: 'moon',
						title: 'Dark'
					},
					{
						value: 'side-by-side',
						icon: 'sidebyside',
						title: 'Side by Side'
					}
				],
				dynamicTitle: true
			}
		}
	},
	initialGlobals: {
		theme: 'side-by-side'
	},

	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		layout: 'fullscreen'
	},

	decorators: [
		(story, { globals }) => {
			const theme = globals.theme;

			if (theme === 'side-by-side') {
				return {
					Component: SideBySideDecorator,
					props: {
						children: story
					}
				};
			}

			return {
				Component: ThemeDecorator,
				props: {
					children: story,
					theme
				}
			};
		}
	]
};

export default preview;
