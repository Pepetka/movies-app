<script lang="ts">
	import type { IProps } from './Spinner.types.svelte';

	const {
		size = 'md',
		variant = 'default',
		label = 'Loading',
		class: className,
		...restProps
	}: IProps = $props();
</script>

<span
	class={['ui-spinner', size, variant, className]}
	role="status"
	aria-label={label}
	{...restProps}
>
	<span class="sr-only">{label}</span>
	<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<circle
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
			class="ui-spinner-track"
		/>
		<path
			d="M12 2a10 10 0 0 1 10 10"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
			class="ui-spinner-head"
		/>
	</svg>
</span>

<style>
	.ui-spinner {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.ui-spinner svg {
		width: 100%;
		height: 100%;
		animation: spin 1s linear infinite;
		transform-origin: center;
	}

	.ui-spinner-track {
		opacity: 0.25;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* Sizes */
	.ui-spinner.sm {
		width: var(--spinner-sm-size);
		height: var(--spinner-sm-size);
	}

	.ui-spinner.md {
		width: var(--spinner-md-size);
		height: var(--spinner-md-size);
	}

	.ui-spinner.lg {
		width: var(--spinner-lg-size);
		height: var(--spinner-lg-size);
	}

	/* Variants */
	.ui-spinner.default {
		color: var(--color-primary);
	}

	.ui-spinner.light {
		color: var(--text-inverse);
	}

	.ui-spinner.inherit {
		color: currentColor;
	}
</style>
