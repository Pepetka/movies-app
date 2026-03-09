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
		contained = false,
		containerSize = 'xl',
		...restProps
	}: IProps = $props();
</script>

<header class={['ui-top-bar', contained && 'contained', className]} {...restProps}>
	{#if contained}
		<div class={['ui-top-bar-inner', containerSize]}>
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
		</div>
	{:else}
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
	{/if}
</header>

<style>
	.ui-top-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-sticky);
		height: var(--top-bar-height);
		display: flex;
		align-items: center;
		padding: 0 var(--space-4);
		background-color: var(--bg-primary);
		border-bottom: 1px solid var(--border-primary);
		gap: var(--space-2);
	}

	.ui-top-bar.contained {
		padding: 0;
	}

	.ui-top-bar-inner {
		display: flex;
		align-items: center;
		flex: 1;
		gap: var(--space-2);
		margin-left: auto;
		margin-right: auto;
		padding-left: var(--container-padding);
		padding-right: var(--container-padding);
	}

	.ui-top-bar-inner.sm {
		max-width: var(--container-sm-max-width);
	}

	.ui-top-bar-inner.md {
		max-width: var(--container-md-max-width);
	}

	.ui-top-bar-inner.lg {
		max-width: var(--container-lg-max-width);
	}

	.ui-top-bar-inner.xl {
		max-width: var(--container-xl-max-width);
	}

	.ui-top-bar-inner.full {
		max-width: 100%;
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
