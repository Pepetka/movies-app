<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import StatusIndicator from './StatusIndicator.svelte';

	const { Story } = defineMeta({
		title: 'Components/StatusIndicator',
		component: StatusIndicator,
		tags: ['autodocs'],
		argTypes: {
			status: { control: 'select', options: ['loading', 'online', 'degraded', 'offline'] },
			size: { control: 'select', options: ['sm', 'md', 'lg'] }
		}
	});
</script>

<Story name="Playground" args={{ status: 'online', size: 'md' }} />

<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">sm</span>
				<StatusIndicator status="online" size="sm" />
				<StatusIndicator status="degraded" size="sm" />
				<StatusIndicator status="offline" size="sm" />
				<StatusIndicator status="loading" size="sm" />
			</div>
			<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">md</span>
				<StatusIndicator status="online" size="md" />
				<StatusIndicator status="degraded" size="md" />
				<StatusIndicator status="offline" size="md" />
				<StatusIndicator status="loading" size="md" />
			</div>
			<div style="display: flex; align-items: center; gap: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary);">lg</span>
				<StatusIndicator status="online" size="lg" />
				<StatusIndicator status="degraded" size="lg" />
				<StatusIndicator status="offline" size="lg" />
				<StatusIndicator status="loading" size="lg" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Online">
	{#snippet template()}
		<div>
			<div style="display: flex; gap: 16px;">
				<StatusIndicator status="online" size="sm" title="Online" />
				<StatusIndicator status="online" size="md" title="Online" />
				<StatusIndicator status="online" size="lg" title="Online" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Degraded">
	{#snippet template()}
		<div>
			<div style="display: flex; gap: 16px;">
				<StatusIndicator status="degraded" size="sm" title="Degraded" />
				<StatusIndicator status="degraded" size="md" title="Degraded" />
				<StatusIndicator status="degraded" size="lg" title="Degraded" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Offline">
	{#snippet template()}
		<div>
			<div style="display: flex; gap: 16px;">
				<StatusIndicator status="offline" size="sm" title="Offline" />
				<StatusIndicator status="offline" size="md" title="Offline" />
				<StatusIndicator status="offline" size="lg" title="Offline" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Loading">
	{#snippet template()}
		<div>
			<div style="display: flex; gap: 16px;">
				<StatusIndicator status="loading" size="sm" title="Loading..." />
				<StatusIndicator status="loading" size="md" title="Loading..." />
				<StatusIndicator status="loading" size="lg" title="Loading..." />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Clickable">
	{#snippet template()}
		<div>
			<p style="margin-bottom: 16px; color: var(--text-tertiary);">
				Click on indicators to test interaction
			</p>
			<div style="display: flex; gap: 16px;">
				<StatusIndicator
					status="online"
					size="md"
					title="Online - Click me"
					onclick={() => alert('Online clicked!')}
				/>
				<StatusIndicator
					status="degraded"
					size="md"
					title="Degraded - Click me"
					onclick={() => alert('Degraded clicked!')}
				/>
				<StatusIndicator
					status="offline"
					size="md"
					title="Offline - Click me"
					onclick={() => alert('Offline clicked!')}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">User List with Status</h3>
			<div style="display: flex; flex-direction: column; gap: 12px;">
				<div
					style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
				>
					<StatusIndicator status="online" size="md" title="Online" />
					<div>
						<div style="font-weight: var(--font-medium);">Alex Smith</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">Online now</div>
					</div>
				</div>
				<div
					style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
				>
					<StatusIndicator status="degraded" size="md" title="Away" />
					<div>
						<div style="font-weight: var(--font-medium);">Maria Johnson</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">Away</div>
					</div>
				</div>
				<div
					style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
				>
					<StatusIndicator status="offline" size="md" title="Offline" />
					<div>
						<div style="font-weight: var(--font-medium);">John Williams</div>
						<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
							Last seen 2h ago
						</div>
					</div>
				</div>
			</div>

			<h3 style="margin: 24px 0 16px; color: var(--text-secondary);">Server Status</h3>
			<div
				style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<StatusIndicator status="online" size="lg" title="Server is online" />
				<div>
					<div style="font-weight: var(--font-medium);">Production Server</div>
					<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
						All systems operational
					</div>
				</div>
			</div>

			<h3 style="margin: 24px 0 16px; color: var(--text-secondary);">Sync Status</h3>
			<div
				style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);"
			>
				<div>
					<div style="font-weight: var(--font-medium);">Syncing movies...</div>
					<div style="font-size: var(--text-sm); color: var(--text-tertiary);">
						Last sync: 5 min ago
					</div>
				</div>
				<StatusIndicator status="loading" size="md" title="Syncing..." />
			</div>
		</div>
	{/snippet}
</Story>
