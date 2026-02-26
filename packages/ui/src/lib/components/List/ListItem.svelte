<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';

	import type { IProps } from './ListItem.types.svelte';

	const {
		interactive = false,
		disabled = false,
		size = 'md',
		leading,
		title,
		subtitle,
		description,
		trailing,
		showChevron = false,
		onclick,
		class: className,
		children,
		...restProps
	}: IProps = $props();

	const handleClick = (e: MouseEvent) => {
		if (disabled) return;
		onclick?.(e);
	};
</script>

<li
	class={['ui-list-item', size, interactive && 'interactive', disabled && 'disabled', className]}
	{...restProps}
>
	{#if interactive}
		<button type="button" class={['ui-list-item-button', size]} {disabled} onclick={handleClick}>
			{#if leading}
				<div class="ui-list-item-leading">{@render leading()}</div>
			{/if}

			<div class="ui-list-item-content">
				{#if children}
					{@render children()}
				{:else}
					{#if title}
						<div class="ui-list-item-title">{title}</div>
					{/if}
					{#if subtitle}
						<div class="ui-list-item-subtitle">{subtitle}</div>
					{/if}
					{#if description}
						<div class="ui-list-item-description">{description}</div>
					{/if}
				{/if}
			</div>

			{#if trailing || showChevron}
				<div class="ui-list-item-trailing">
					{#if trailing}
						{@render trailing()}
					{/if}
					{#if showChevron}
						<ChevronRight class="ui-list-item-chevron" size={18} absoluteStrokeWidth />
					{/if}
				</div>
			{/if}
		</button>
	{:else}
		{#if leading}
			<div class="ui-list-item-leading">{@render leading()}</div>
		{/if}

		<div class="ui-list-item-content">
			{#if children}
				{@render children()}
			{:else}
				{#if title}
					<div class="ui-list-item-title">{title}</div>
				{/if}
				{#if subtitle}
					<div class="ui-list-item-subtitle">{subtitle}</div>
				{/if}
				{#if description}
					<div class="ui-list-item-description">{description}</div>
				{/if}
			{/if}
		</div>

		{#if trailing || showChevron}
			<div class="ui-list-item-trailing">
				{#if trailing}
					{@render trailing()}
				{/if}
				{#if showChevron}
					<ChevronRight class="ui-list-item-chevron" size={18} absoluteStrokeWidth />
				{/if}
			</div>
		{/if}
	{/if}
</li>

<style>
	.ui-list-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		min-height: 48px;
	}

	/* No padding for interactive - button handles it */
	.ui-list-item.interactive {
		padding: 0;
	}

	/* Sizes */
	.ui-list-item.sm {
		padding: var(--space-2) var(--space-3);
		gap: var(--space-2);
		min-height: 40px;
	}

	.ui-list-item.sm.interactive {
		padding: 0;
	}

	.ui-list-item.lg {
		padding: var(--space-4) var(--space-5);
		gap: var(--space-4);
		min-height: 56px;
	}

	.ui-list-item.lg.interactive {
		padding: 0;
	}

	/* Interactive button wrapper */
	.ui-list-item-button {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) var(--space-4);
		min-height: 48px;
		background: transparent;
		border: none;
		text-align: left;
		cursor: pointer;
		transition: background-color var(--transition-fast) var(--ease-out);
	}

	.ui-list-item-button.sm {
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		min-height: 40px;
	}

	.ui-list-item-button.lg {
		gap: var(--space-4);
		padding: var(--space-4) var(--space-5);
		min-height: 56px;
	}

	.ui-list-item-button:hover:not(:disabled) {
		background-color: var(--bg-secondary);
	}

	.ui-list-item-button:active:not(:disabled) {
		background-color: var(--bg-tertiary);
	}

	.ui-list-item-button:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: -2px;
	}

	.ui-list-item-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Content areas */
	.ui-list-item-leading {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.ui-list-item-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.ui-list-item-trailing {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	/* Typography */
	.ui-list-item-title {
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		line-height: var(--leading-tight);
	}

	.ui-list-item-subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-normal);
	}

	.ui-list-item-description {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		line-height: var(--leading-normal);
	}

	/* Chevron */
	:global(.ui-list-item-chevron) {
		color: var(--text-tertiary);
		flex-shrink: 0;
	}

	/* Disabled (non-interactive) */
	.ui-list-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
