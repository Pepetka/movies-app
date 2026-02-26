<script lang="ts">
	import type { IProps } from './Tabs.types.svelte';

	let {
		tabs,
		value = $bindable(),
		onChange,
		scrollable = true,
		ariaLabel = 'Tabs',
		class: className,
		...restProps
	}: IProps = $props();

	const activeTab = $derived(value ?? tabs[0]?.id);

	const selectTab = (tabId: string) => {
		value = tabId;
		onChange?.(tabId);
	};

	const tabButtons = $state.raw<(HTMLButtonElement | null)[]>([]);

	const handleKeydown = (event: KeyboardEvent, currentIndex: number) => {
		const enabledIndices = tabs.map((t, i) => (!t.disabled ? i : -1)).filter((i) => i !== -1);

		// eslint-disable-next-line no-useless-assignment -- assigned in switch
		let nextIndex = currentIndex;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				nextIndex =
					enabledIndices[
						(enabledIndices.indexOf(currentIndex) - 1 + enabledIndices.length) %
							enabledIndices.length
					];
				break;
			case 'ArrowRight':
				event.preventDefault();
				nextIndex =
					enabledIndices[(enabledIndices.indexOf(currentIndex) + 1) % enabledIndices.length];
				break;
			case 'Home':
				event.preventDefault();
				nextIndex = enabledIndices[0];
				break;
			case 'End':
				event.preventDefault();
				nextIndex = enabledIndices[enabledIndices.length - 1];
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				selectTab(tabs[currentIndex].id);
				return;
			default:
				return;
		}

		tabButtons[nextIndex]?.focus();
	};
</script>

<div
	class={['ui-tabs', scrollable && 'scrollable', className]}
	role="tablist"
	aria-label={ariaLabel}
	{...restProps}
>
	<div class="ui-tabs-list">
		{#each tabs as tab, index (tab.id)}
			<button
				bind:this={tabButtons[index]}
				class="ui-tabs-tab"
				role="tab"
				id="tab-{tab.id}"
				aria-selected={tab.id === activeTab}
				tabindex={tab.id === activeTab ? 0 : -1}
				disabled={tab.disabled}
				onclick={() => selectTab(tab.id)}
				onkeydown={(e) => handleKeydown(e, index)}
			>
				{tab.label}
				{#if tab.count !== undefined}
					<span class="ui-tabs-badge">{tab.count}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.ui-tabs {
		display: flex;
		border-bottom: 1px solid var(--border-primary);
		position: relative;
	}

	.ui-tabs.scrollable {
		overflow-x: auto;
		scrollbar-width: none;
	}

	.ui-tabs.scrollable::-webkit-scrollbar {
		display: none;
	}

	.ui-tabs-list {
		display: flex;
		gap: var(--space-1);
		position: relative;
	}

	.ui-tabs-tab {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-secondary);
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		white-space: nowrap;
		transition:
			color var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out);
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.ui-tabs-tab:hover:not(:disabled) {
		color: var(--text-primary);
	}

	.ui-tabs-tab[aria-selected='true'] {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
	}

	.ui-tabs-tab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ui-tabs-tab:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.ui-tabs-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 var(--space-1);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		background-color: var(--bg-tertiary);
		color: var(--text-secondary);
		border-radius: var(--radius-full);
	}

	.ui-tabs-tab[aria-selected='true'] .ui-tabs-badge {
		background-color: var(--color-primary);
		color: var(--text-inverse);
	}
</style>
