<script lang="ts">
	interface Props {
		id?: string;
		value?: number;
		size?: number;
		disabled?: boolean;
		onChange?: (value: number) => void;
	}

	let { id, value = 0, size = 32, disabled = false, onChange }: Props = $props();

	let starsRef = $state.raw<HTMLDivElement | null>(null);
	let hoverValue = $state(0);
	let isDragging = $state(false);

	const STAR_COUNT = 5;

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
	aria-valuemin={0.5}
	aria-valuemax={5}
	aria-valuenow={value > 0 ? value : undefined}
	aria-disabled={disabled}
	aria-label="Оценка фильма"
	tabindex={disabled ? -1 : 0}
	onkeydown={handleKeyDown}
>
	<div
		class="stars-track"
		role="none"
		bind:this={starsRef}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointerleave={handlePointerLeave}
		onpointercancel={handlePointerCancel}
	>
		{#each Array(STAR_COUNT) as _, starIndex (starIndex)}
			<div class="star-wrapper" style="--star-size: {size}px;">
				<!-- Background star (empty) -->
				<svg viewBox="0 0 24 24" fill="none" class="star-bg" aria-hidden="true">
					<path
						d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						stroke="currentColor"
						stroke-width="1.5"
					/>
				</svg>

				<!-- Value star (persisted rating, dimmed) -->
				{#if getValueFill(starIndex) > 0}
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						class="star-value"
						aria-hidden="true"
						style="clip-path: {getValueFill(starIndex) === 0.5 ? 'inset(0 50% 0 0)' : 'none'};"
					>
						<path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						/>
					</svg>
				{/if}

				<!-- Filled star (hover / active) -->
				{#if getStarFill(starIndex) > 0}
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						class="star-fill"
						aria-hidden="true"
						style="clip-path: {getStarFill(starIndex) === 0.5 ? 'inset(0 50% 0 0)' : 'none'};"
					>
						<path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						/>
					</svg>
				{/if}
			</div>
		{/each}
	</div>

	{#if displayValue > 0}
		<span class="star-rating-input__value" aria-hidden="true">{displayValue.toFixed(1)}/5</span>
	{/if}
</div>

<style>
	.star-rating-input {
		display: inline-flex;
		align-items: center;
		user-select: none;
		-webkit-user-select: none;
	}

	.star-rating-input.disabled {
		pointer-events: none;
	}

	.star-rating-input.dragging {
		cursor: grabbing;
	}

	.stars-track {
		display: inline-flex;
		align-items: center;
		touch-action: none;
	}

	.star-wrapper {
		position: relative;
		flex-shrink: 0;
		width: var(--star-size);
		height: var(--star-size);
		padding: 0 calc(var(--space-1) / 2);
	}

	.star-bg,
	.star-value,
	.star-fill {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: var(--star-size);
		height: var(--star-size);
	}

	.star-bg {
		color: var(--text-tertiary);
	}

	.star-value {
		color: var(--rating-gold, #f59e0b);
		opacity: 0.3;
		transition: clip-path 0.15s ease;
	}

	.star-fill {
		color: var(--rating-gold, #f59e0b);
		transition: clip-path 0.15s ease;
	}

	.star-rating-input__value {
		margin-left: var(--space-2);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--text-secondary);
		min-width: 2.5rem;
	}
</style>
