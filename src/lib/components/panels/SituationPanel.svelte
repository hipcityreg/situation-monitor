<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { timeAgo } from '$lib/utils';
	import { _ } from 'svelte-i18n';
	import type { PanelId } from '$lib/config';
	import type { NewsItem } from '$lib/types';

	interface SituationConfig {
		title: string;
		subtitle: string;
		criticalKeywords?: string[];
	}

	interface Props {
		panelId: PanelId;
		config: SituationConfig;
		news?: NewsItem[];
		loading?: boolean;
		error?: string | null;
	}

	let { panelId, config, news = [], loading = false, error = null }: Props = $props();

	// Calculate threat level based on news
	const threatLevel = $derived(calculateThreatLevel(news, config.criticalKeywords));

	function calculateThreatLevel(
		newsItems: NewsItem[],
		criticalKeywords: string[] = []
	): { level: string; text: string } {
		if (newsItems.length === 0) {
			return { level: 'monitoring', text: 'MONITORING' };
		}

		const now = Date.now();
		const recentNews = newsItems.filter((n) => {
			const hoursSince = (now - n.timestamp) / (1000 * 60 * 60);
			return hoursSince < 24;
		});

		const hasCritical = newsItems.some((n) =>
			criticalKeywords.some((k) => n.title.toLowerCase().includes(k))
		);

		if (hasCritical || recentNews.length >= 3) {
			return { level: 'critical', text: 'CRITICAL' };
		}
		if (recentNews.length >= 1) {
			return { level: 'elevated', text: 'ELEVATED' };
		}
		return { level: 'monitoring', text: 'MONITORING' };
	}
</script>

<Panel
	id={panelId}
	title={config.title}
	status={threatLevel.text}
	statusClass={threatLevel.level}
	{loading}
	{error}
>
	<div class="situation-content">
		<div class="situation-header">
			<div class="situation-title">{config.title}</div>
			<div class="situation-subtitle">{config.subtitle}</div>
		</div>

		{#if news.length === 0 && !loading && !error}
			<div class="empty-state">{$_('common.noData')}</div>
		{:else}
			<div class="situation-news">
				{#each news.slice(0, 8) as item (item.id)}
					<div class="situation-item">
						<a href={item.link} target="_blank" rel="noopener noreferrer" class="headline">
							{item.title}
						</a>
						<div class="meta">{item.source} · {timeAgo(item.timestamp)}</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Panel>

<style>
	.situation-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.situation-header {
		text-align: center;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.situation-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.situation-subtitle {
		font-size: 0.6rem;
		color: var(--text-secondary);
		margin-top: 0.1rem;
	}

	.situation-news {
		display: flex;
		flex-direction: column;
	}

	.situation-item {
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--border);
	}

	.situation-item:last-child {
		border-bottom: none;
	}

	.headline {
		display: block;
		font-size: 0.65rem;
		color: var(--text-primary);
		text-decoration: none;
		line-height: 1.35;
	}

	.headline:hover {
		color: var(--accent);
	}

	.meta {
		font-size: 0.55rem;
		color: var(--text-muted);
		margin-top: 0.2rem;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
