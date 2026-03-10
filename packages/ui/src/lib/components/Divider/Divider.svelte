<script lang="ts">
	import type { IProps } from './Divider.types.svelte';

	const {
		orientation = 'horizontal',
		inset = false,
		label,
		class: className,
		...restProps
	}: IProps = $props();
</script>

{#if label && orientation === 'horizontal'}
	<div class={['ui-divider', 'with-label', inset && 'inset', className]} {...restProps}>
		<span class="ui-divider__label">{label}</span>
	</div>
{:else}
	<hr class={['ui-divider', orientation, inset && 'inset', className]} {...restProps} />
{/if}

<style>
	.ui-divider {
		border: none;
		background-color: var(--border-primary);
	}

	.ui-divider.horizontal {
		width: 100%;
		height: var(--border-width-thin);
	}

	.ui-divider.vertical {
		width: var(--border-width-thin);
		height: 100%;
		align-self: stretch;
	}

	.ui-divider.horizontal.inset {
		width: calc(100% - var(--space-4) * 2);
		align-self: center;
	}

	.ui-divider.vertical.inset {
		height: calc(100% - var(--space-4) * 2);
		align-self: center;
	}

	.ui-divider.with-label {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		background-color: transparent;
		height: auto;
		width: 100%;
	}

	.ui-divider.with-label::before,
	.ui-divider.with-label::after {
		content: '';
		flex: 1;
		height: var(--border-width-thin);
		background-color: var(--border-primary);
	}

	.ui-divider__label {
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}
</style>
