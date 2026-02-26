<script lang="ts">
	import type { IProps } from './Input.types.svelte';
	import { getIconSize } from '../../utils/size';

	let {
		type = 'text',
		size = 'md',
		label,
		value = $bindable(''),
		error,
		helper,
		disabled,
		Icon,
		iconAction,
		iconLabel,
		onChange,
		class: className,
		...restProps
	}: IProps = $props();

	const inputId = crypto.randomUUID();
	const errorId = crypto.randomUUID();
	const helperId = crypto.randomUUID();

	let isFocused = $state(false);
	let hasValue = $derived((value?.length ?? 0) > 0);
	let isLabelFloating = $derived(isFocused || hasValue);

	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onChange?.(value);
	};
</script>

<div class={['ui-input-wrapper', size, { error, disabled }, className]}>
	<div class="ui-input-container">
		<input
			id={inputId}
			{type}
			{value}
			oninput={handleInput}
			{disabled}
			aria-invalid={!!error}
			aria-errormessage={error ? errorId : undefined}
			aria-describedby={helper ? helperId : undefined}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			class:with-icon={Icon}
			{...restProps}
		/>
		<label
			for={inputId}
			class={['ui-input-label', { floating: isLabelFloating, focused: isFocused, error }]}
		>
			{label}
		</label>
		{#if Icon}
			{#if iconAction}
				<button
					type="button"
					class="ui-input-icon-btn"
					onclick={iconAction}
					aria-label={iconLabel}
					{disabled}
				>
					<Icon size={getIconSize(size)} />
				</button>
			{:else}
				<span class="ui-input-icon">
					<Icon size={getIconSize(size)} />
				</span>
			{/if}
		{/if}
	</div>
	{#if error}
		<div id={errorId} class="ui-input-message error">
			{error}
		</div>
	{:else if helper}
		<div id={helperId} class="ui-input-message">
			{helper}
		</div>
	{/if}
</div>

<style>
	.ui-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}

	.ui-input-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	/* Base input styles */
	.ui-input-container input {
		width: 100%;
		height: var(--input-md-height);
		padding: var(--input-md-padding);
		font-family: inherit;
		font-size: 16px;
		line-height: 1.5;
		color: var(--text-primary);
		background-color: var(--input-bg);
		border: var(--border-width-thin) solid var(--input-border);
		border-radius: var(--radius-input);
		outline: none;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background-color 5000s ease-in-out 0s;
	}

	/* Remove browser autofill styling */
	.ui-input-container input:-webkit-autofill,
	.ui-input-container input:-webkit-autofill:hover,
	.ui-input-container input:-webkit-autofill:focus,
	.ui-input-container input:-webkit-autofill:active {
		-webkit-text-fill-color: var(--text-primary) !important;
		-webkit-box-shadow: 0 0 0 1000px var(--input-bg) inset !important;
		transition: background-color 5000s ease-in-out 0s;
	}

	/* Hide placeholder */
	.ui-input-container input::placeholder {
		color: transparent;
		pointer-events: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	/* Show actual placeholder when label is floating */
	.ui-input-container input:focus::placeholder {
		color: var(--text-tertiary);
	}

	/* Hover state */
	.ui-input-container input:hover:not(:disabled):not(:focus) {
		border-color: var(--text-tertiary);
	}

	/* Focus state */
	.ui-input-container input:focus {
		border-color: var(--color-primary);
	}

	/* Disabled */
	.ui-input-container input:disabled {
		background-color: var(--bg-tertiary);
		color: var(--text-tertiary);
		cursor: not-allowed;
	}

	.ui-input-container input:disabled + .ui-input-label {
		background: linear-gradient(to bottom, transparent 50%, var(--bg-tertiary) 50%);
	}

	/* With icon padding */
	.ui-input-container input.with-icon {
		padding-right: 44px;
	}

	/* Floating label */
	.ui-input-label {
		position: absolute;
		left: var(--input-md-padding-x);
		top: 50%;
		transform: translateY(-50%);
		font-size: 18px;
		font-weight: 400;
		color: var(--text-tertiary);
		background: linear-gradient(to bottom, transparent 50%, var(--input-bg) 50%);
		padding: 0;
		pointer-events: none;
		transition:
			top 0.2s ease,
			transform 0.2s ease,
			font-size 0.2s ease,
			color 0.2s ease,
			background 0.2s ease,
			padding 0.2s ease;
		transform-origin: left center;
	}

	.ui-input-label.floating {
		top: 0;
		transform: translateY(-50%) scale(0.92);
		font-size: 13px;
		color: var(--text-secondary);
		padding: 0 4px;
	}

	.ui-input-label.focused {
		color: var(--color-primary);
	}

	/* Icon */
	.ui-input-icon {
		position: absolute;
		right: var(--input-md-padding-x);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-tertiary);
		pointer-events: none;
	}

	.ui-input-icon-btn {
		position: absolute;
		right: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		border-radius: 8px;
		color: var(--text-tertiary);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.ui-input-icon-btn:hover:not(:disabled) {
		background-color: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.ui-input-icon-btn:active:not(:disabled) {
		background-color: var(--bg-secondary);
		transform: scale(0.96);
	}

	.ui-input-icon-btn:not(:disabled):focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.ui-input-icon-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Helper / Error message */
	.ui-input-message {
		font-size: 13px;
		line-height: 1.4;
		color: var(--text-tertiary);
		padding-left: 4px;
	}

	.ui-input-message.error {
		color: var(--color-error);
	}

	/* Error state */
	.ui-input-wrapper.error .ui-input-container input {
		border-color: var(--color-error);
	}

	.ui-input-wrapper.error .ui-input-container input:focus {
		border-color: var(--color-error);
	}

	.ui-input-wrapper.error .ui-input-label {
		color: var(--color-error);
	}

	.ui-input-wrapper.error .ui-input-label.focused {
		color: var(--color-error);
	}

	/* Small size */
	.ui-input-wrapper.sm .ui-input-container input {
		height: var(--input-sm-height);
		padding: var(--input-sm-padding);
		font-size: 14px;
	}

	.ui-input-wrapper.sm .ui-input-label {
		left: var(--input-sm-padding-x);
		font-size: 16px;
	}

	.ui-input-wrapper.sm .ui-input-label.floating {
		font-size: 12px;
	}

	.ui-input-wrapper.sm .ui-input-container input.with-icon {
		padding-right: 40px;
	}

	.ui-input-wrapper.sm .ui-input-icon,
	.ui-input-wrapper.sm .ui-input-icon-btn {
		right: 8px;
	}

	.ui-input-wrapper.sm .ui-input-icon-btn {
		width: 28px;
		height: 28px;
	}

	/* Large size */
	.ui-input-wrapper.lg .ui-input-container input {
		height: var(--input-lg-height);
		padding: var(--input-lg-padding);
		font-size: 18px;
	}

	.ui-input-wrapper.lg .ui-input-label {
		left: var(--input-lg-padding-x);
		font-size: 20px;
	}

	.ui-input-wrapper.lg .ui-input-label.floating {
		font-size: 14px;
	}

	.ui-input-wrapper.lg .ui-input-container input.with-icon {
		padding-right: 52px;
	}

	.ui-input-wrapper.lg .ui-input-icon,
	.ui-input-wrapper.lg .ui-input-icon-btn {
		right: 12px;
	}

	.ui-input-wrapper.lg .ui-input-icon-btn {
		width: 36px;
		height: 36px;
	}
</style>
