<script lang="ts">
	import { Badge } from '@repo/ui';

	import type { IProps } from './MovieStatusBadge.types';

	let { status, ...restProps }: IProps = $props();

	const statusConfig: Record<
		Exclude<typeof status, undefined>,
		{ label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'error' }
	> = {
		tracking: { label: 'К просмотру', variant: 'default' },
		planned: { label: 'План', variant: 'primary' },
		watched: { label: 'Смотрели', variant: 'success' }
	};

	const config = $derived(statusConfig[status]);
</script>

<Badge variant={config.variant} size="sm" {...restProps}>
	{config.label}
</Badge>
