<script lang="ts">
	import type { IProps } from './Divider.types.svelte';

	const {
		orientation = 'horizontal',
		inset = false,
		class: className,
		...restProps
	}: IProps = $props();
</script>

<hr class={['ui-divider', orientation, inset && 'inset', className]} {...restProps} />

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
</style>
