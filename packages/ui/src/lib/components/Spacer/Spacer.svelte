<script lang="ts">
	import type { IProps } from './Spacer.types.svelte';

	const { size = '4', class: className, ...restProps }: IProps = $props();
</script>

<div class={['ui-spacer', `size-${size}`, className]} aria-hidden="true" {...restProps}></div>

<style>
	.ui-spacer {
		flex-shrink: 0;
	}

	.ui-spacer.size-1 {
		height: var(--space-1);
	}
	.ui-spacer.size-2 {
		height: var(--space-2);
	}
	.ui-spacer.size-3 {
		height: var(--space-3);
	}
	.ui-spacer.size-4 {
		height: var(--space-4);
	}
	.ui-spacer.size-5 {
		height: var(--space-5);
	}
	.ui-spacer.size-6 {
		height: var(--space-6);
	}
	.ui-spacer.size-8 {
		height: var(--space-8);
	}
	.ui-spacer.size-10 {
		height: var(--space-10);
	}
	.ui-spacer.size-12 {
		height: var(--space-12);
	}
	.ui-spacer.size-16 {
		height: var(--space-16);
	}
	.ui-spacer.size-20 {
		height: var(--space-20);
	}
	.ui-spacer.size-24 {
		height: var(--space-24);
	}
</style>
