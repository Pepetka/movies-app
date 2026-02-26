<script lang="ts">
	import { Inbox, AlertCircle } from '@lucide/svelte';

	import { getEmptyStateIconSize } from '../../utils/size';
	import type { IProps } from './EmptyState.types.svelte';

	const {
		variant = 'default',
		size = 'md',
		title,
		description,
		Icon: IconProp,
		action,
		class: className,
		...restProps
	}: IProps = $props();

	const Icon = $derived(IconProp ?? (variant === 'error' ? AlertCircle : Inbox));
	const iconSize = $derived(getEmptyStateIconSize(size));
</script>

<div
	class={['ui-empty-state', variant, size, className]}
	role="status"
	aria-label={title || 'Empty state'}
	{...restProps}
>
	<div class="ui-empty-state-icon">
		<Icon size={iconSize} absoluteStrokeWidth />
	</div>

	{#if title}
		<p class="ui-empty-state-title">{title}</p>
	{/if}

	{#if description}
		<p class="ui-empty-state-description">{description}</p>
	{/if}

	{#if action}
		<div class="ui-empty-state-action">
			{@render action()}
		</div>
	{/if}
</div>

<style>
	.ui-empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.ui-empty-state-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-tertiary);
	}

	.ui-empty-state-title {
		margin: 0;
		font-weight: var(--font-medium);
		color: var(--text-primary);
	}

	.ui-empty-state-description {
		margin: 0;
		color: var(--text-secondary);
	}

	.ui-empty-state-action {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Sizes */
	.ui-empty-state.sm .ui-empty-state-icon {
		margin-bottom: var(--space-2);
	}

	.ui-empty-state.sm .ui-empty-state-title {
		font-size: var(--text-sm);
		margin-bottom: var(--space-1);
	}

	.ui-empty-state.sm .ui-empty-state-description {
		font-size: var(--text-xs);
		margin-bottom: var(--space-2);
	}

	.ui-empty-state.md .ui-empty-state-icon {
		margin-bottom: var(--space-3);
	}

	.ui-empty-state.md .ui-empty-state-title {
		font-size: var(--text-base);
		margin-bottom: var(--space-2);
	}

	.ui-empty-state.md .ui-empty-state-description {
		font-size: var(--text-sm);
		margin-bottom: var(--space-3);
	}

	.ui-empty-state.lg .ui-empty-state-icon {
		margin-bottom: var(--space-4);
	}

	.ui-empty-state.lg .ui-empty-state-title {
		font-size: var(--text-lg);
		margin-bottom: var(--space-2);
	}

	.ui-empty-state.lg .ui-empty-state-description {
		font-size: var(--text-base);
		margin-bottom: var(--space-4);
	}

	/* Compact variant */
	.ui-empty-state.compact {
		padding: var(--space-4);
	}

	.ui-empty-state.compact .ui-empty-state-icon {
		margin-bottom: var(--space-2);
	}

	.ui-empty-state.compact .ui-empty-state-title {
		margin-bottom: var(--space-1);
	}

	.ui-empty-state.compact .ui-empty-state-description {
		margin-bottom: var(--space-2);
	}

	/* Error variant */
	.ui-empty-state.error .ui-empty-state-icon {
		color: var(--color-error);
	}

	.ui-empty-state.error .ui-empty-state-title {
		color: var(--color-error);
	}
</style>
