<script lang="ts">
	import type { IProps } from './Switch.types.svelte';

	let {
		label,
		checked = $bindable(false),
		disabled = false,
		size = 'md',
		helper,
		onChange,
		class: className,
		...restProps
	}: IProps = $props();

	const switchId = crypto.randomUUID();
	const labelId = crypto.randomUUID();
	const helperId = crypto.randomUUID();

	const toggle = () => {
		if (disabled) return;
		checked = !checked;
		onChange?.(checked);
	};
</script>

<div class={['ui-switch-wrapper', size, { disabled }, className]}>
	<button
		type="button"
		role="switch"
		id={switchId}
		aria-checked={checked}
		aria-labelledby={labelId}
		aria-describedby={helper ? helperId : undefined}
		{disabled}
		onclick={toggle}
		class={['ui-switch', { checked }]}
		{...restProps}
	>
		<span class="ui-switch-thumb"></span>
	</button>
	<div class="ui-switch-label-container">
		<span id={labelId} class="ui-switch-label">{label}</span>
		{#if helper}
			<span id={helperId} class="ui-switch-helper">{helper}</span>
		{/if}
	</div>
</div>

<style>
	.ui-switch-wrapper {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		width: 100%;
	}

	.ui-switch-wrapper.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ui-switch {
		position: relative;
		flex-shrink: 0;
		width: var(--switch-md-width);
		height: var(--switch-md-height);
		background-color: var(--bg-tertiary);
		border: none;
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.ui-switch:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.ui-switch.checked {
		background-color: var(--color-primary);
	}

	@media (hover: hover) {
		.ui-switch:hover:not(:disabled):not(:focus-visible) {
			background-color: var(--border-secondary);
		}
	}

	@media (hover: hover) {
		.ui-switch.checked:hover:not(:disabled):not(:focus-visible) {
			background-color: var(--color-primary-hover);
		}
	}

	.ui-switch:active:not(:disabled) {
		transform: scale(0.95);
	}

	.ui-switch:disabled {
		cursor: not-allowed;
	}

	.ui-switch-thumb {
		position: absolute;
		top: 4px;
		left: 4px;
		width: var(--switch-md-thumb-size);
		height: var(--switch-md-thumb-size);
		background-color: var(--bg-primary);
		border-radius: var(--radius-full);
		box-shadow: var(--shadow-sm);
		transition: transform 0.2s ease;
	}

	.ui-switch.checked .ui-switch-thumb {
		transform: translateX(var(--switch-md-thumb-offset));
	}

	.ui-switch-label-container {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-top: 4px;
	}

	.ui-switch-label {
		font-size: var(--text-base);
		font-weight: 400;
		color: var(--text-primary);
		cursor: pointer;
		user-select: none;
	}

	.ui-switch-wrapper.disabled .ui-switch-label {
		cursor: not-allowed;
	}

	.ui-switch-helper {
		font-size: 13px;
		color: var(--text-tertiary);
	}

	/* Small */
	.ui-switch-wrapper.sm .ui-switch {
		width: var(--switch-sm-width);
		height: var(--switch-sm-height);
	}

	.ui-switch-wrapper.sm .ui-switch-thumb {
		top: 3px;
		left: 3px;
		width: var(--switch-sm-thumb-size);
		height: var(--switch-sm-thumb-size);
	}

	.ui-switch-wrapper.sm .ui-switch.checked .ui-switch-thumb {
		transform: translateX(var(--switch-sm-thumb-offset));
	}

	.ui-switch-wrapper.sm .ui-switch-label-container {
		padding-top: 2px;
	}

	.ui-switch-wrapper.sm .ui-switch-label {
		font-size: 14px;
	}

	/* Large */
	.ui-switch-wrapper.lg .ui-switch {
		width: var(--switch-lg-width);
		height: var(--switch-lg-height);
	}

	.ui-switch-wrapper.lg .ui-switch-thumb {
		top: 5px;
		left: 5px;
		width: var(--switch-lg-thumb-size);
		height: var(--switch-lg-thumb-size);
	}

	.ui-switch-wrapper.lg .ui-switch.checked .ui-switch-thumb {
		transform: translateX(var(--switch-lg-thumb-offset));
	}

	.ui-switch-wrapper.lg .ui-switch-label-container {
		padding-top: 6px;
	}

	.ui-switch-wrapper.lg .ui-switch-label {
		font-size: 18px;
	}
</style>
