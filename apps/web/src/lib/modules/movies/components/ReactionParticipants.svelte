<script lang="ts">
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import { Avatar } from '@repo/ui';

	import { formatDate, sortByDateField, pluralize } from '$lib/utils';

	import type { IProps } from './ReactionParticipants.types.svelte';

	let { reactions }: IProps = $props();

	let expanded = $state(false);

	const sortedReactions = $derived(sortByDateField(reactions, 'createdAt', 'desc'));

	const uniqueUsers = $derived(
		Array.from(new Map(sortedReactions.map((r) => [r.userId, r])).values())
	);

	const topUsers = $derived(uniqueUsers.slice(0, 3));
	const remainingCount = $derived(Math.max(0, uniqueUsers.length - 3));

	const totalCount = $derived(reactions.length);

	const toggle = () => {
		expanded = !expanded;
	};
</script>

<div class="reaction-participants">
	<button
		type="button"
		class="reaction-participants__summary"
		onclick={toggle}
		aria-expanded={expanded}
	>
		<span class="reaction-participants__label">
			{totalCount}
			{pluralize(totalCount, ['реакция', 'реакции', 'реакций'])}
		</span>

		{#if topUsers.length > 0}
			<div class="reaction-participants__avatars">
				{#each topUsers as user, i (user.userId)}
					<span class="reaction-participants__avatar-wrap" style:z-index={topUsers.length - i}>
						<Avatar src={user.userAvatar} name={user.userName} size="xs" />
					</span>
				{/each}
				{#if remainingCount > 0}
					<span class="reaction-participants__remaining">+{remainingCount}</span>
				{/if}
			</div>
		{/if}

		<span class="reaction-participants__chevron" aria-hidden="true">
			{#if expanded}
				<ChevronUp size={16} />
			{:else}
				<ChevronDown size={16} />
			{/if}
		</span>
	</button>

	{#if expanded}
		<ul class="reaction-participants__list">
			{#each sortedReactions as reaction (reaction.id)}
				<li class="reaction-participants__item">
					<Avatar src={reaction.userAvatar} name={reaction.userName} size="xs" />
					<div class="reaction-participants__info">
						<span class="reaction-participants__name">
							{reaction.userName}
							{#if reaction.isOwn}
								<span class="reaction-participants__own">(вы)</span>
							{/if}
						</span>
						<span class="reaction-participants__date">
							{formatDate(reaction.createdAt, 'short')}
						</span>
					</div>
					<span class="reaction-participants__emoji">{reaction.emoji}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.reaction-participants {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.reaction-participants__summary {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) 0;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--text-secondary);
		width: 100%;
	}

	.reaction-participants__label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
	}

	.reaction-participants__avatars {
		display: flex;
		align-items: center;
	}

	.reaction-participants__avatar-wrap {
		margin-left: -0.5rem;
		border-radius: var(--radius-full);
		box-shadow: 0 0 0 2px var(--bg-primary);
	}

	.reaction-participants__avatar-wrap:first-child {
		margin-left: 0;
	}

	.reaction-participants__remaining {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-6);
		height: var(--space-6);
		margin-left: -0.5rem;
		border-radius: var(--radius-full);
		background-color: var(--bg-tertiary);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--text-secondary);
		box-shadow: 0 0 0 2px var(--bg-primary);
	}

	.reaction-participants__chevron {
		margin-left: auto;
		color: var(--text-tertiary);
	}

	.reaction-participants__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.reaction-participants__item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		border-radius: var(--radius-md);
		background-color: var(--bg-secondary);
	}

	.reaction-participants__info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.reaction-participants__name {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.reaction-participants__own {
		color: var(--text-tertiary);
		font-weight: var(--font-normal);
	}

	.reaction-participants__date {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.reaction-participants__emoji {
		font-size: var(--text-lg);
		margin-left: auto;
		flex-shrink: 0;
	}
</style>
