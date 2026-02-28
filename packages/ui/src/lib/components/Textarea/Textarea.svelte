<script lang="ts">
	import type { IProps } from './Textarea.types.svelte';

	let {
		label,
		value = $bindable(''),
		error,
		helper,
		disabled,
		rows = 3,
		maxRows,
		maxlength,
		autoGrow = true,
		onChange,
		class: className,
		...restProps
	}: IProps = $props();

	const textareaId = crypto.randomUUID();
	const errorId = crypto.randomUUID();
	const helperId = crypto.randomUUID();

	let isFocused = $state(false);
	let hasValue = $derived((value?.length ?? 0) > 0);
	let isLabelFloating = $derived(isFocused || hasValue);
	let textareaElement = $state.raw<HTMLTextAreaElement | null>(null);

	const calculateHeight = () => {
		if (!textareaElement) return { minHeight: 0, maxHeight: Infinity };

		const computedStyle = getComputedStyle(textareaElement);
		const lineHeight = parseFloat(computedStyle.lineHeight);
		const paddingTop = parseFloat(computedStyle.paddingTop);
		const paddingBottom = parseFloat(computedStyle.paddingBottom);

		const minHeight = Math.round(paddingTop + paddingBottom + lineHeight * rows);
		const maxHeight = maxRows
			? Math.round(paddingTop + paddingBottom + lineHeight * maxRows)
			: Infinity;

		return { minHeight, maxHeight };
	};

	const autoResize = () => {
		if (!textareaElement || !autoGrow) return;

		const { minHeight, maxHeight } = calculateHeight();

		textareaElement.style.overflowY = 'hidden';
		textareaElement.style.height = '0px';
		const scrollHeight = textareaElement.scrollHeight;
		const targetHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
		textareaElement.style.height = `${targetHeight}px`;

		if (scrollHeight > maxHeight) {
			textareaElement.style.overflowY = 'auto';
		}
	};

	const handleInput = (e: Event) => {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		onChange?.(value);
		autoResize();
	};

	$effect(() => {
		if (autoGrow && textareaElement) {
			autoResize();
		}
	});

	let charCount = $derived(value?.length ?? 0);
	let isExceeded = $derived(maxlength && charCount > maxlength);
</script>

<div class={['ui-textarea-wrapper', { error, disabled }, className]}>
	<div class="ui-textarea-container">
		<textarea
			bind:this={textareaElement}
			id={textareaId}
			{value}
			{maxlength}
			aria-invalid={!!error}
			aria-errormessage={error ? errorId : undefined}
			aria-describedby={helper ? helperId : undefined}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			oninput={handleInput}
			class:auto-grow={autoGrow}
			style:--min-rows={rows}
			style:--max-rows={maxRows ?? 'unset'}
			{...restProps}
		></textarea>
		<label
			for={textareaId}
			class={['ui-textarea-label', { floating: isLabelFloating, focused: isFocused, error }]}
		>
			{label}
		</label>
	</div>
	<div class="ui-textarea-footer">
		{#if error}
			<div id={errorId} class="ui-textarea-message error">
				{error}
			</div>
		{:else if helper}
			<div id={helperId} class="ui-textarea-message">
				{helper}
			</div>
		{/if}
		{#if maxlength}
			<div class={['ui-textarea-counter', { exceeded: isExceeded }]}>
				{charCount}/{maxlength}
			</div>
		{/if}
	</div>
</div>

<style>
	.ui-textarea-wrapper {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}

	.ui-textarea-container {
		position: relative;
		display: flex;
		align-items: flex-start;
	}

	/* Base textarea styles */
	.ui-textarea-container textarea {
		width: 100%;
		min-height: calc(1.5em * var(--min-rows, 3) + 24px);
		padding: var(--textarea-padding);
		font-family: inherit;
		font-size: var(--text-base);
		line-height: var(--leading-normal);
		color: var(--text-primary);
		background-color: var(--input-bg);
		border: var(--border-width-thin) solid var(--input-border);
		border-radius: var(--radius-input);
		outline: none;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background-color 5000s ease-in-out 0s;
		resize: vertical;
		overflow-y: auto;
	}

	.ui-textarea-container textarea.auto-grow {
		resize: none;
		overflow: hidden;
		min-height: calc(1.5em * var(--min-rows, 3) + 24px);
		max-height: calc(1.5em * var(--max-rows, 20) + 24px);
	}

	/* Hide placeholder */
	.ui-textarea-container textarea::placeholder {
		color: transparent;
		pointer-events: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	/* Show actual placeholder when label is floating */
	.ui-textarea-container textarea:focus::placeholder {
		color: var(--text-tertiary);
	}

	/* Scrollbar styling */
	.ui-textarea-container textarea::-webkit-scrollbar {
		width: 6px;
	}

	.ui-textarea-container textarea::-webkit-scrollbar-track {
		background: transparent;
	}

	.ui-textarea-container textarea::-webkit-scrollbar-thumb {
		background: var(--text-tertiary);
		border-radius: 3px;
	}

	@media (hover: hover) {
		.ui-textarea-container textarea::-webkit-scrollbar-thumb:hover {
			background: var(--text-secondary);
		}
	}

	/* Hover state */
	@media (hover: hover) {
		.ui-textarea-container textarea:hover:not(:disabled):not(:focus) {
			border-color: var(--text-tertiary);
		}
	}

	/* Focus state */
	.ui-textarea-container textarea:focus {
		border-color: var(--color-primary);
	}

	/* Disabled */
	.ui-textarea-container textarea:disabled {
		background-color: var(--bg-tertiary);
		color: var(--text-tertiary);
		cursor: not-allowed;
		resize: none;
	}

	.ui-textarea-container textarea:disabled + .ui-textarea-label {
		background: linear-gradient(to bottom, transparent 50%, var(--bg-tertiary) 50%);
	}

	/* Floating label */
	.ui-textarea-label {
		position: absolute;
		left: 12px;
		top: 12px;
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
		transform-origin: left top;
	}

	.ui-textarea-label.floating {
		top: 0;
		transform: translateY(-50%) scale(0.92);
		font-size: 13px;
		color: var(--text-secondary);
		padding: 0 4px;
	}

	.ui-textarea-label.focused {
		color: var(--color-primary);
	}

	/* Footer */
	.ui-textarea-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8px;
		min-height: 18px;
	}

	/* Helper / Error message */
	.ui-textarea-message {
		font-size: 13px;
		line-height: 1.4;
		color: var(--text-tertiary);
		padding-left: 4px;
		flex: 1;
	}

	.ui-textarea-message.error {
		color: var(--color-error);
	}

	/* Counter */
	.ui-textarea-counter {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-tertiary);
		white-space: nowrap;
	}

	.ui-textarea-counter.exceeded {
		color: var(--color-error);
	}

	/* Error state */
	.ui-textarea-wrapper.error .ui-textarea-container textarea {
		border-color: var(--color-error);
	}

	.ui-textarea-wrapper.error .ui-textarea-container textarea:focus {
		border-color: var(--color-error);
	}

	.ui-textarea-wrapper.error .ui-textarea-label {
		color: var(--color-error);
	}

	.ui-textarea-wrapper.error .ui-textarea-label.focused {
		color: var(--color-error);
	}
</style>
