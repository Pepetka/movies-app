<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';

	import type { IProps } from './Select.types.svelte';
	import { getIconSize } from '../../utils/size';

	let {
		label,
		options,
		value = $bindable(''),
		error,
		helper,
		disabled,
		size = 'md',
		onChange,
		class: className,
		placeholder,
		...restProps
	}: IProps = $props();

	const selectId = crypto.randomUUID();
	const errorId = crypto.randomUUID();
	const helperId = crypto.randomUUID();

	let isFocused = $state(false);
	let hasValue = $derived(value !== '' && value !== undefined);
	let isLabelFloating = $derived(isFocused || hasValue);
	let showPlaceholder = $derived(placeholder && !hasValue && isLabelFloating);

	const handleChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		value = target.value;
		onChange?.(value);
	};
</script>

<div class={['ui-select-wrapper', size, { error, disabled }, className]}>
	<div class="ui-select-container">
		<select
			id={selectId}
			{value}
			onchange={handleChange}
			{disabled}
			aria-invalid={!!error}
			aria-errormessage={error ? errorId : undefined}
			aria-describedby={helper ? helperId : undefined}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			{...restProps}
		>
			{#each options as option (option.value)}
				<option value={option.value} disabled={option.disabled}>
					{option.label}
				</option>
			{/each}
		</select>
		<label
			for={selectId}
			class={['ui-select-label', { floating: isLabelFloating, focused: isFocused, error }]}
		>
			{label}
		</label>
		{#if placeholder}
			<span class="ui-select-placeholder" class:hidden={!showPlaceholder}>
				{placeholder}
			</span>
		{/if}
		<span class="ui-select-icon">
			<ChevronDown size={getIconSize(size)} />
		</span>
	</div>
	{#if error}
		<div id={errorId} class="ui-select-message error">
			{error}
		</div>
	{:else if helper}
		<div id={helperId} class="ui-select-message">
			{helper}
		</div>
	{/if}
</div>

<style>
	.ui-select-wrapper {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}

	.ui-select-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	/* Base select styles */
	.ui-select-container select {
		width: 100%;
		height: var(--input-md-height);
		padding: 0 36px 0 var(--input-md-padding-x);
		font-family: inherit;
		font-size: 16px;
		line-height: 1.5;
		color: var(--text-primary);
		background-color: var(--input-bg);
		border: var(--border-width-thin) solid var(--input-border);
		border-radius: var(--radius-input);
		outline: none;
		cursor: pointer;
		appearance: none;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	/* Hover state */
	@media (hover: hover) {
		.ui-select-container select:hover:not(:disabled):not(:focus) {
			border-color: var(--text-tertiary);
		}
	}

	/* Focus state */
	.ui-select-container select:focus {
		border-color: var(--color-primary);
	}

	/* Disabled */
	.ui-select-container select:disabled {
		background-color: var(--bg-tertiary);
		color: var(--text-tertiary);
		cursor: not-allowed;
		opacity: 1;
	}

	.ui-select-container select:disabled ~ .ui-select-label {
		background: linear-gradient(to bottom, transparent 50%, var(--bg-tertiary) 50%);
	}

	/* Floating label */
	.ui-select-label {
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

	.ui-select-label.floating {
		top: 0;
		transform: translateY(-50%) scale(0.92);
		font-size: 13px;
		color: var(--text-secondary);
		padding: 0 4px;
	}

	.ui-select-label.focused {
		color: var(--color-primary);
	}

	/* Floating placeholder */
	.ui-select-placeholder {
		position: absolute;
		left: var(--input-md-padding-x);
		top: 50%;
		transform: translateY(-50%);
		font-size: 16px;
		font-weight: 400;
		color: var(--text-tertiary);
		pointer-events: none;
		transition: opacity 0.2s ease;
	}

	.ui-select-placeholder.hidden {
		opacity: 0;
		pointer-events: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	/* Dropdown icon */
	.ui-select-icon {
		position: absolute;
		right: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-tertiary);
		pointer-events: none;
		transition: transform 0.2s ease;
	}

	/* Rotate icon on focus */
	.ui-select-container select:focus ~ .ui-select-icon {
		transform: rotate(180deg);
	}

	.ui-select-container select:disabled ~ .ui-select-icon {
		opacity: 0.5;
	}

	/* Helper / Error message */
	.ui-select-message {
		font-size: 13px;
		line-height: 1.4;
		color: var(--text-tertiary);
		padding-left: 4px;
	}

	.ui-select-message.error {
		color: var(--color-error);
	}

	/* Error state */
	.ui-select-wrapper.error .ui-select-container select {
		border-color: var(--color-error);
	}

	.ui-select-wrapper.error .ui-select-container select:focus {
		border-color: var(--color-error);
	}

	.ui-select-wrapper.error .ui-select-label {
		color: var(--color-error);
	}

	.ui-select-wrapper.error .ui-select-label.focused {
		color: var(--color-error);
	}

	/* Small size */
	.ui-select-wrapper.sm .ui-select-container select {
		height: var(--input-sm-height);
		padding: 0 32px 0 var(--input-sm-padding-x);
		font-size: 14px;
	}

	.ui-select-wrapper.sm .ui-select-label {
		left: var(--input-sm-padding-x);
		font-size: 16px;
	}

	.ui-select-wrapper.sm .ui-select-label.floating {
		font-size: 12px;
	}

	.ui-select-wrapper.sm .ui-select-placeholder {
		left: var(--input-sm-padding-x);
		font-size: 14px;
	}

	.ui-select-wrapper.sm .ui-select-icon {
		right: 8px;
	}

	/* Large size */
	.ui-select-wrapper.lg .ui-select-container select {
		height: var(--input-lg-height);
		padding: 0 40px 0 var(--input-lg-padding-x);
		font-size: 18px;
	}

	.ui-select-wrapper.lg .ui-select-label {
		left: var(--input-lg-padding-x);
		font-size: 20px;
	}

	.ui-select-wrapper.lg .ui-select-label.floating {
		font-size: 14px;
	}

	.ui-select-wrapper.lg .ui-select-placeholder {
		left: var(--input-lg-padding-x);
		font-size: 18px;
	}

	.ui-select-wrapper.lg .ui-select-icon {
		right: 12px;
	}
</style>
