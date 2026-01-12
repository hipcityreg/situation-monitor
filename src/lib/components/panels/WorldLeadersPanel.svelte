<script lang="ts">
	import { Panel } from '$lib/components/common';
	import type { WorldLeader } from '$lib/types';

	interface Props {
		leaders?: WorldLeader[];
		loading?: boolean;
		error?: string | null;
	}

	let { leaders = [], loading = false, error = null }: Props = $props();

	const count = $derived(leaders.length);

	function getActivityClass(newsCount: number): string {
		if (newsCount >= 3) return 'high-activity';
		if (newsCount >= 1) return 'active';
		return '';
	}
</script>

<Panel id="leaders" title="World Leaders" {count} {loading} {error}>
	{#if leaders.length === 0 && !loading && !error}
		<div class="empty-state">No leaders data available</div>
	{:else}
		<div class="leaders-grid">
			{#each leaders as leader (leader.id)}
				{@const newsCount = leader.news?.length || 0}
				{@const activityClass = getActivityClass(newsCount)}
				{@const latestNews = leader.news?.slice(0, 2) || []}
				<div class="leader-card {activityClass}">
					<div class="leader-header">
						<span class="leader-flag">{leader.flag}</span>
						<div class="leader-info">
							<div class="leader-name">{leader.name}</div>
							<div class="leader-title">{leader.title}</div>
							<div class="leader-country">{leader.country}</div>
						</div>
						{#if newsCount > 0}
							<div class="leader-activity-badge">{newsCount}</div>
						{/if}
					</div>
					<div class="leader-meta">
						<span class="leader-since">Since {leader.since}</span>
						<span class="leader-party">{leader.party}</span>
					</div>
					{#if leader.focus && leader.focus.length > 0}
						<div class="leader-focus-topics">
							{#each leader.focus.slice(0, 3) as topic}
								<span class="leader-focus">{topic}</span>
							{/each}
						</div>
					{/if}
					{#if latestNews.length > 0}
						<div class="leader-news">
							{#each latestNews as news}
								<a href={news.link} target="_blank" class="leader-news-item" title={news.title}>
									{news.title.length > 60 ? news.title.substring(0, 60) + '...' : news.title}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.leaders-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.leader-card {
		background: var(--card-bg);
		border: 1px solid var(--border-strong);
		border-radius: 2px; /* rounded-sm per design system */
		padding: 0.75rem;
		transition: all 0.2s;
	}

	.leader-card:hover {
		border-color: var(--border-light);
		background: var(--surface-hover);
	}

	.leader-card.active {
		border-color: var(--info);
	}

	.leader-card.high-activity {
		border-color: var(--warning);
		box-shadow: 0 0 8px rgba(255, 170, 0, 0.2);
	}

	.leader-header {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.leader-flag {
		font-size: 1.5rem;
		line-height: 1;
	}

	.leader-info {
		flex: 1;
		min-width: 0;
	}

	.leader-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.leader-title {
		font-size: 0.65rem;
		color: var(--text-dim);
		margin-top: 0.1rem;
	}

	.leader-country {
		font-size: 0.6rem;
		color: var(--text-muted);
		margin-top: 0.15rem;
	}

	.leader-activity-badge {
		background: var(--info);
		color: #000;
		font-size: 0.55rem;
		font-weight: bold;
		padding: 0.15rem 0.35rem;
		border-radius: 2px;
		min-width: 18px;
		text-align: center;
	}

	.leader-card.high-activity .leader-activity-badge {
		background: var(--warning);
	}

	.leader-meta {
		display: flex;
		gap: 0.5rem;
		font-size: 0.55rem;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
	}

	.leader-since {
		color: var(--text-dim);
	}

	.leader-party {
		color: var(--text-muted);
		opacity: 0.8;
	}

	.leader-focus-topics {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.leader-focus {
		font-size: 0.5rem;
		background: rgba(68, 136, 255, 0.15);
		color: var(--info);
		padding: 0.1rem 0.35rem;
		border-radius: 2px;
		text-transform: lowercase;
	}

	.leader-news {
		border-top: 1px solid var(--border);
		padding-top: 0.5rem;
		margin-top: 0.25rem;
	}

	.leader-news-item {
		display: block;
		font-size: 0.6rem;
		color: var(--text-dim);
		text-decoration: none;
		padding: 0.25rem 0;
		line-height: 1.3;
		border-bottom: 1px solid var(--border);
	}

	.leader-news-item:last-child {
		border-bottom: none;
	}

	.leader-news-item:hover {
		color: var(--text-primary);
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
