<script lang="ts">
	import { Button, Divider } from '@repo/ui';

	import { getSafeRedirect, ROUTES } from '$lib/utils';

	interface Props {
		buttonText?: string;
		showDivider?: boolean;
	}

	let { buttonText = 'Войти через Google', showDivider = true }: Props = $props();
</script>

<Button
	variant="secondary"
	fullWidth
	href={`${__API_URL__}/api/v1/auth/oauth/google?redirect=${encodeURIComponent(getSafeRedirect(ROUTES.GROUPS))}`}
>
	{buttonText}
</Button>

{#if showDivider}
	<Divider label="или" />
{/if}
