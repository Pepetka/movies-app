<script lang="ts">
	import { goto } from '$app/navigation';

	$effect(() => {
		void goto('/profile?linked=1', { replaceState: true });
	});
</script>

<p>Аккаунт привязан, перенаправляем…</p>
