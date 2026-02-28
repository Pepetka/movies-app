<script lang="ts">
	import { Sun, Moon } from '@lucide/svelte';

	import { getThemeButtonIconSize, getThemeButtonPadding } from '$lib/utils/size';
	import { themeStore } from '$lib/stores/theme.store.svelte';

	import type { IProps } from './ThemeButton.types.svelte';

	const {
		size = 'md',
		labelEnableLight = 'Switch to light mode',
		labelEnableDark = 'Switch to dark mode',
		titleLight = 'Light mode',
		titleDark = 'Dark mode',
		class: className,
		...restProps
	}: IProps = $props();

	const isDark = $derived(themeStore.theme);
	const iconSize = $derived(getThemeButtonIconSize(size));
	const padding = $derived(getThemeButtonPadding(size));
</script>

<button
	type="button"
	class={['ui-theme-btn', size, className]}
	onclick={() => themeStore.toggle()}
	aria-label={isDark ? labelEnableLight : labelEnableDark}
	title={isDark ? titleLight : titleDark}
	style:padding="{padding}px"
	{...restProps}
>
	{#if isDark}
		<Sun size={iconSize} absoluteStrokeWidth />
	{:else}
		<Moon size={iconSize} absoluteStrokeWidth />
	{/if}
</button>

<style>
	.ui-theme-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--radius-full);
		background-color: var(--bg-secondary);
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			color var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out);
	}

	.ui-theme-btn.sm {
		width: var(--theme-btn-sm-size);
		height: var(--theme-btn-sm-size);
	}

	.ui-theme-btn.md {
		width: var(--theme-btn-md-size);
		height: var(--theme-btn-md-size);
	}

	.ui-theme-btn.lg {
		width: var(--theme-btn-lg-size);
		height: var(--theme-btn-lg-size);
	}

	.ui-theme-btn :global(svg) {
		width: auto;
		height: auto;
	}

	@media (hover: hover) {
		.ui-theme-btn:hover {
			background-color: var(--bg-tertiary);
			color: var(--text-primary);
		}
	}

	.ui-theme-btn:active {
		transform: scale(0.95);
	}

	.ui-theme-btn:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
</style>
