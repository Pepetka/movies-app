<script lang="ts">
	import { Check, Minus } from '@lucide/svelte';

	import type { IProps, CheckboxSize } from './Checkbox.types.svelte';

	const ICON_SIZE_MAP: Record<CheckboxSize, number> = {
		sm: 14,
		md: 18,
		lg: 22
	};

	let {
		label,
		checked = $bindable(false),
		disabled = false,
		size = 'md',
		helper,
		error,
		indeterminate = false,
		onChange,
		class: className,
		...restProps
	}: IProps = $props();

	const inputId = crypto.randomUUID();
	const helperId = crypto.randomUUID();
	const errorId = crypto.randomUUID();

	const handleChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		checked = target.checked;
		onChange?.(checked);
	};
</script>

<div class={['ui-checkbox-wrapper', size, { disabled, error }, className]}>
	<div class="ui-checkbox-container">
		<input
			id={inputId}
			type="checkbox"
			{checked}
			{disabled}
			aria-invalid={!!error}
			aria-errormessage={error ? errorId : undefined}
			aria-describedby={helper ? helperId : undefined}
			onchange={handleChange}
			class="ui-checkbox-input"
			{...restProps}
		/>
		<span class={['ui-checkbox-box', { checked, indeterminate }]} aria-hidden="true">
			{#if checked}
				<Check size={ICON_SIZE_MAP[size]} />
			{:else if indeterminate}
				<Minus size={ICON_SIZE_MAP[size]} />
			{/if}
		</span>
	</div>
	{#if label || helper || error}
		<div class="ui-checkbox-label-container">
			{#if label}
				<label for={inputId} class="ui-checkbox-label">{label}</label>
			{/if}
			{#if error}
				<span id={errorId} class="ui-checkbox-error">{error}</span>
			{:else if helper}
				<span id={helperId} class="ui-checkbox-helper">{helper}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.ui-checkbox-wrapper {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		width: 100%;
	}

	.ui-checkbox-wrapper.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ui-checkbox-container {
		position: relative;
		flex-shrink: 0;
	}

	.ui-checkbox-input {
		position: absolute;
		opacity: 0;
		width: var(--checkbox-md-size);
		height: var(--checkbox-md-size);
		margin: 0;
		cursor: pointer;
	}

	.ui-checkbox-wrapper.disabled .ui-checkbox-input {
		cursor: not-allowed;
	}

	.ui-checkbox-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--checkbox-md-size);
		height: var(--checkbox-md-size);
		background-color: transparent;
		border: 2px solid var(--border-secondary);
		border-radius: var(--radius-md);
		pointer-events: none;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
		color: var(--bg-primary);
	}

	.ui-checkbox-input:focus-visible + .ui-checkbox-box {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.ui-checkbox-input:hover:not(:disabled):not(:focus-visible) + .ui-checkbox-box {
		border-color: var(--text-tertiary);
	}

	.ui-checkbox-input:checked + .ui-checkbox-box,
	.ui-checkbox-box.indeterminate {
		background-color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.ui-checkbox-input:checked:hover:not(:disabled):not(:focus-visible) + .ui-checkbox-box,
	.ui-checkbox-box.indeterminate:hover:not(:disabled):not(:focus-visible) {
		background-color: var(--color-primary-hover);
		border-color: var(--color-primary-hover);
	}

	.ui-checkbox-label-container {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-top: 2px;
	}

	.ui-checkbox-label {
		font-size: 16px;
		font-weight: 400;
		color: var(--text-primary);
		cursor: pointer;
		user-select: none;
	}

	.ui-checkbox-wrapper.disabled .ui-checkbox-label {
		cursor: not-allowed;
	}

	.ui-checkbox-helper {
		font-size: 13px;
		color: var(--text-tertiary);
	}

	.ui-checkbox-error {
		font-size: 13px;
		color: var(--color-error);
	}

	/* Error state */
	.ui-checkbox-wrapper.error .ui-checkbox-box {
		border-color: var(--color-error);
	}

	.ui-checkbox-wrapper.error
		.ui-checkbox-input:hover:not(:disabled):not(:focus-visible)
		+ .ui-checkbox-box {
		border-color: var(--color-error-hover);
	}

	.ui-checkbox-wrapper.error .ui-checkbox-input:checked + .ui-checkbox-box {
		background-color: var(--color-error);
		border-color: var(--color-error);
	}

	.ui-checkbox-wrapper.error
		.ui-checkbox-input:checked:hover:not(:disabled):not(:focus-visible)
		+ .ui-checkbox-box {
		background-color: var(--color-error-hover);
		border-color: var(--color-error-hover);
	}

	/* Small */
	.ui-checkbox-wrapper.sm .ui-checkbox-input {
		width: var(--checkbox-sm-size);
		height: var(--checkbox-sm-size);
	}

	.ui-checkbox-wrapper.sm .ui-checkbox-box {
		width: var(--checkbox-sm-size);
		height: var(--checkbox-sm-size);
	}

	.ui-checkbox-wrapper.sm .ui-checkbox-label-container {
		padding-top: 0;
	}

	.ui-checkbox-wrapper.sm .ui-checkbox-label {
		font-size: 14px;
	}

	/* Large */
	.ui-checkbox-wrapper.lg .ui-checkbox-input {
		width: var(--checkbox-lg-size);
		height: var(--checkbox-lg-size);
	}

	.ui-checkbox-wrapper.lg .ui-checkbox-box {
		width: var(--checkbox-lg-size);
		height: var(--checkbox-lg-size);
	}

	.ui-checkbox-wrapper.lg .ui-checkbox-label-container {
		padding-top: 4px;
	}

	.ui-checkbox-wrapper.lg .ui-checkbox-label {
		font-size: 18px;
	}
</style>
