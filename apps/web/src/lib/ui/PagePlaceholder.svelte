<script lang="ts">
	import { Button, type ButtonVariant } from '@repo/ui';
	import { ArrowLeft } from '@lucide/svelte';

	import { goto } from '$app/navigation';

	interface Props {
		title: string;
		hint?: string;
		backTo?: string;
		backLabel?: string;
		variant?: ButtonVariant;
	}

	let { title, hint, backTo, backLabel = 'Назад', variant = 'secondary' }: Props = $props();

	const handleBack = () => {
		if (backTo) void goto(backTo);
	};
</script>

<div class="page-placeholder">
	<p>{title}</p>
	{#if hint}
		<p class="hint">{hint}</p>
	{/if}
	{#if backTo}
		<Button {variant} onclick={handleBack}>
			<ArrowLeft size={16} />
			{backLabel}
		</Button>
	{/if}
</div>

<style>
	.page-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		padding-block: var(--space-4);
		text-align: center;
	}

	p {
		margin: 0;
		color: var(--text-primary);
	}

	.hint {
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}
</style>
