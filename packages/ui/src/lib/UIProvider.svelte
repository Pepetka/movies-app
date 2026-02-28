<script lang="ts">
	import { themeStore } from './stores/theme.store.svelte';
	import type { ToastPosition } from './components/Toast';
	import { ToastContainer } from './components/Toast';
	import './styles';

	interface UIProviderProps {
		toastPosition?: ToastPosition;
		maxToasts?: number;
		initTheme?: boolean;
	}

	const {
		toastPosition = 'top-center',
		maxToasts = 3,
		initTheme = true
	}: UIProviderProps = $props();

	$effect(() => {
		if (initTheme) {
			void themeStore.persisted;
		}
	});
</script>

<ToastContainer position={toastPosition} {maxToasts} />
