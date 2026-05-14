<script lang="ts">
	interface Props {
		id?: string;
		value?: number;
		size?: number;
		disabled?: boolean;
		label?: string;
		onChange?: (value: number) => void;
	}

	let {
		id,
		value = 0,
		size = 32,
		disabled = false,
		label = 'Оценка фильма',
		onChange
	}: Props = $props();

	let starsRef = $state.raw<HTMLDivElement | null>(null);
	let hoverValue = $state(0);
	let isDragging = $state(false);

	const STAR_COUNT = 5;
	const STAR_INDICES = Array.from({ length: STAR_COUNT }, (_, i) => i);

	const displayValue = $derived(hoverValue || value);

	const getRatingFromX = (clientX: number): number => {
		if (!starsRef) return value;
		const rect = starsRef.getBoundingClientRect();
		const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
		const starWidth = rect.width / STAR_COUNT;
		const raw = x / starWidth;
		let rating = Math.ceil(raw * 2) / 2;
		rating = Math.max(0.5, Math.min(STAR_COUNT, rating));
		return rating;
	};

	const handlePointerDown = (e: PointerEvent) => {
		if (disabled) return;
		try {
			starsRef?.setPointerCapture(e.pointerId);
		} catch {
			/* ignore */
		}
		isDragging = true;
		hoverValue = getRatingFromX(e.clientX);
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (disabled) return;
		if (isDragging) {
			hoverValue = getRatingFromX(e.clientX);
		} else if (e.pointerType === 'mouse') {
			hoverValue = getRatingFromX(e.clientX);
		}
	};

	const handlePointerUp = (e: PointerEvent) => {
		if (disabled) return;
		const wasDragging = isDragging;
		isDragging = false;
		const rating = getRatingFromX(e.clientX);
		hoverValue = 0;
		if (wasDragging && rating !== value) {
			onChange?.(rating);
		}
	};

	const handlePointerLeave = () => {
		if (!isDragging) {
			hoverValue = 0;
		}
	};

	const handlePointerCancel = () => {
		isDragging = false;
		hoverValue = 0;
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) return;
		let newValue = value;
		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowUp':
				newValue = Math.min(5, value + 0.5);
				e.preventDefault();
				break;
			case 'ArrowLeft':
			case 'ArrowDown':
				newValue = Math.max(0.5, value - 0.5);
				e.preventDefault();
				break;
			case 'Home':
				newValue = 0.5;
				e.preventDefault();
				break;
			case 'End':
				newValue = 5;
				e.preventDefault();
				break;
		}
		if (newValue !== value) {
			onChange?.(newValue);
		}
	};

	const getStarFill = (starIndex: number): number => {
		const v = displayValue;
		if (v >= starIndex + 1) return 1;
		if (v >= starIndex + 0.5) return 0.5;
		return 0;
	};

	const getValueFill = (starIndex: number): number => {
		const v = value;
		if (v >= starIndex + 1) return 1;
		if (v >= starIndex + 0.5) return 0.5;
		return 0;
	};
</script>

<div
	{id}
	class="star-rating-input"
	class:disabled
	class:dragging={isDragging}
	role="slider"
	aria-valuemin={0}
	aria-valuemax={5}
	aria-valuenow={value}
	aria-valuetext={value > 0 ? `${value.toFixed(1)} из 5` : 'Оценка не выставлена'}
	aria-disabled={disabled}
	aria-label={label}
	aria-labelledby={id ? `${id}-label` : undefined}
	tabindex={disabled ? -1 : 0}
	onkeydown={handleKeyDown}
>
	<div
		class="star-rating-input__track"
		role="none"
		bind:this={starsRef}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointerleave={handlePointerLeave}
		onpointercancel={handlePointerCancel}
	>
		{#each STAR_INDICES as starIndex (starIndex)}
			<div class="star-rating-input__wrapper" style="--star-size: {size}px;">
				<!-- Background star (empty) -->
				<svg viewBox="0 0 24 24" fill="none" class="star-rating-input__bg" aria-hidden="true">
					<path
						d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						stroke="currentColor"
						stroke-width="1.5"
					/>
				</svg>

				<!-- Value star (persisted rating, dimmed) -->
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					class="star-rating-input__star-value"
					class:star-rating-input__star--hidden={getValueFill(starIndex) === 0}
					aria-hidden="true"
					style="clip-path: {getValueFill(starIndex) === 0.5 ? 'inset(0 50% 0 0)' : 'none'};"
				>
					<path
						d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
					/>
				</svg>

				<!-- Filled star (hover / active) -->
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					class="star-rating-input__fill"
					class:star-rating-input__star--hidden={getStarFill(starIndex) === 0}
					aria-hidden="true"
					style="clip-path: {getStarFill(starIndex) === 0.5 ? 'inset(0 50% 0 0)' : 'none'};"
				>
					<path
						d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
					/>
				</svg>
			</div>
		{/each}
	</div>

	{#if displayValue > 0}
		<span class="star-rating-input__text" aria-hidden="true">{displayValue.toFixed(1)}/5</span>
	{/if}
</div>

<style>
	.star-rating-input {
		display: inline-flex;
		align-items: center;
		user-select: none;
		-webkit-user-select: none;
		cursor: pointer;
	}

	.star-rating-input.disabled {
		pointer-events: none;
		cursor: default;
	}

	.star-rating-input.dragging {
		cursor: grabbing;
	}

	.star-rating-input:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.star-rating-input__track {
		display: inline-flex;
		align-items: center;
		touch-action: none;
	}

	.star-rating-input__wrapper {
		position: relative;
		flex-shrink: 0;
		width: var(--star-size);
		height: var(--star-size);
		padding: 0 calc(var(--space-1) / 2);
	}

	.star-rating-input__bg,
	.star-rating-input__star-value,
	.star-rating-input__fill {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: var(--star-size);
		height: var(--star-size);
	}

	.star-rating-input__bg {
		color: var(--text-tertiary);
	}

	.star-rating-input__star-value {
		color: var(--rating-gold, #f59e0b);
		opacity: 0.3;
		transition: clip-path 0.15s ease;
	}

	.star-rating-input__fill {
		color: var(--rating-gold, #f59e0b);
		transition: clip-path 0.15s ease;
	}

	.star-rating-input__star--hidden {
		opacity: 0;
	}

	.star-rating-input__text {
		margin-left: var(--space-2);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--text-secondary);
		min-width: 2.5rem;
	}
</style>
