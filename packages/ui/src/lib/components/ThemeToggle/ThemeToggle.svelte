<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';

	import {
		getThemeToggleIconSize,
		getThemeTogglePadding,
		getThemeToggleGap,
		getThemeToggleButtonPadding
	} from '$lib/utils/size';
	import { themeStore, type PersistedTheme } from '$lib/stores/theme.store.svelte';

	import type { IProps, ThemeLabels } from './ThemeToggle.types.svelte';

	const defaultLabels: ThemeLabels = {
		light: 'Light',
		dark: 'Dark',
		system: 'System',
		ariaLabel: 'Theme preferences'
	};

	const { size = 'md', labels = {}, class: className, ...restProps }: IProps = $props();

	const mergedLabels = $derived({ ...defaultLabels, ...labels });

	interface ThemeOption {
		value: PersistedTheme;
		icon: typeof Sun;
		label: string;
	}

	const options: ThemeOption[] = $derived([
		{ value: 'light', icon: Sun, label: mergedLabels.light },
		{ value: 'dark', icon: Moon, label: mergedLabels.dark },
		{ value: 'system', icon: Monitor, label: mergedLabels.system }
	]);

	const iconSize = $derived(getThemeToggleIconSize(size));
	const padding = $derived(getThemeTogglePadding(size));
	const gap = $derived(getThemeToggleGap(size));
	const buttonPadding = $derived(getThemeToggleButtonPadding(size));

	function selectTheme(value: PersistedTheme): void {
		themeStore.setTheme(value);
	}
</script>

<div
	class={['ui-theme-toggle', size, className]}
	role="radiogroup"
	aria-label={mergedLabels.ariaLabel}
	style:gap="{gap}px"
	style:padding="{padding}px"
	{...restProps}
>
	{#each options as option (option.value)}
		{@const Icon = option.icon}
		<button
			type="button"
			class="ui-theme-toggle-btn"
			class:active={themeStore.persisted === option.value}
			class:size
			onclick={() => selectTheme(option.value)}
			role="radio"
			aria-checked={themeStore.persisted === option.value}
			aria-label={option.label}
			title={option.label}
			style:padding="{buttonPadding}px"
		>
			<Icon size={iconSize} absoluteStrokeWidth />
		</button>
	{/each}
</div>

<style>
	.ui-theme-toggle {
		display: flex;
		align-items: center;
		background-color: var(--bg-secondary);
		border-radius: var(--radius-lg);
		width: fit-content;
	}

	.ui-theme-toggle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--radius-md);
		background-color: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background-color var(--transition-fast) var(--ease-out),
			color var(--transition-fast) var(--ease-out),
			transform var(--transition-fast) var(--ease-out);
	}

	.ui-theme-toggle-btn :global(svg) {
		width: auto;
		height: auto;
	}

	@media (hover: hover) {
		.ui-theme-toggle-btn:hover {
			background-color: var(--bg-tertiary);
		}
	}

	.ui-theme-toggle-btn.active {
		background-color: var(--bg-primary);
		color: var(--color-primary);
		box-shadow: var(--card-shadow);
	}

	.ui-theme-toggle-btn:active {
		transform: scale(0.95);
	}

	.ui-theme-toggle-btn:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.ui-theme-toggle-btn.sm {
		width: var(--theme-toggle-container-sm);
		height: var(--theme-toggle-container-sm);
	}

	.ui-theme-toggle-btn.md {
		width: var(--theme-toggle-container-md);
		height: var(--theme-toggle-container-md);
	}

	.ui-theme-toggle-btn.lg {
		width: var(--theme-toggle-container-lg);
		height: var(--theme-toggle-container-lg);
	}
</style>
