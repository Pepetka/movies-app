<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';

	import type { IProps } from './TopBar.types.svelte';
	import { IconButton } from '../IconButton';

	const {
		title,
		showBack = false,
		onBack,
		class: className,
		leading,
		trailing,
		children,
		...restProps
	}: IProps = $props();
</script>

<header class={['ui-top-bar', className]} {...restProps}>
	{#if leading}
		<div class="ui-top-bar-left">
			{@render leading()}
		</div>
	{:else if showBack}
		<div class="ui-top-bar-left">
			<IconButton Icon={ArrowLeft} label="Go back" variant="ghost" size="md" onclick={onBack} />
		</div>
	{/if}

	{#if children}
		{@render children()}
	{:else if title}
		<h1 class="ui-top-bar-title" aria-label={title}>{title}</h1>
	{/if}

	{#if trailing}
		<div class="ui-top-bar-right">
			{@render trailing()}
		</div>
	{/if}
</header>

<style>
	.ui-top-bar {
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
		height: 56px;
		display: flex;
		align-items: center;
		padding: 0 var(--space-4);
		background-color: var(--bg-primary);
		border-bottom: 1px solid var(--border-primary);
		gap: var(--space-2);
	}

	.ui-top-bar-title {
		flex: 1 0 auto;
		min-width: 0;
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin: 0;
	}

	.ui-top-bar-left,
	.ui-top-bar-right {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: var(--space-2);
	}
</style>
