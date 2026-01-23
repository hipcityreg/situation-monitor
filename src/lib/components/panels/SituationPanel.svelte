<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { timeAgo } from '$lib/utils';
	import { _ } from 'svelte-i18n';
	import type { PanelId } from '$lib/config';
	import type { NewsItem } from '$lib/types';
	import { settings } from '$lib/stores/settings';
	import { translate } from '$lib/services/translation';

	interface SituationConfig {
		titleKey: string;
		subtitleKey: string;
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

	// Translation settings
	const currentLocale = $derived(settings.getLocale());
	const autoTranslate = $derived(settings.getAutoTranslate());
	const shouldTranslate = $derived(currentLocale === 'zh' && autoTranslate);

	// Track translated news titles - use object for better reactivity
	let translations = $state<Record<string, string>>({});
	let pending = $state<Record<string, boolean>>({});

	// Get translated config values
	const title = $derived($_(`situation.${config.titleKey}`));
	const subtitle = $derived($_(`situation.${config.subtitleKey}`));

	// Calculate threat level based on news
	const threatLevel = $derived(calculateThreatLevel(news, config.criticalKeywords));
	const threatText = $derived($_(`situation.${threatLevel.level}`));

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

	// Get translated news title
	function getTranslatedTitle(item: NewsItem): string {
		if (!shouldTranslate) return item.title;
		return translations[item.id] || item.title;
	}

	// Translate a single news item
	async function translateNews(itemId: string, title: string) {
		if (translations[itemId] || pending[itemId]) return;
		
		pending = { ...pending, [itemId]: true };
		
		try {
			const translated = await translate(title, 'zh');
			translations = { ...translations, [itemId]: translated };
		} catch {
			// Keep original on error
		} finally {
			const { [itemId]: _, ...rest } = pending;
			pending = rest;
		}
	}

	// Translate all news when conditions are met
	$effect(() => {
		if (!shouldTranslate || news.length === 0) return;

		// Collect all news items to translate
		const toTranslate: Array<{ id: string; title: string }> = [];
		
		for (const item of news) {
			if (!translations[item.id] && !pending[item.id]) {
				toTranslate.push({ id: item.id, title: item.title });
			}
		}

		// Translate sequentially with small delays
		let delay = 0;
		for (const item of toTranslate) {
			setTimeout(() => translateNews(item.id, item.title), delay);
			delay += 200;
		}
	});
</script>

<Panel
	id={panelId}
	title={title}
	status={threatText}
	statusClass={threatLevel.level}
	{loading}
	{error}
>
	<div class="situation-content">
		<div class="situation-header">
			<div class="situation-title">{title}</div>
			<div class="situation-subtitle">{subtitle}</div>
		</div>

		{#if news.length === 0 && !loading && !error}
			<div class="empty-state">{$_('common.noData')}</div>
		{:else}
			<div class="situation-news">
				{#each news.slice(0, 8) as item (item.id)}
					<div class="situation-item">
						<a href={item.link} target="_blank" rel="noopener noreferrer" class="headline">
							{getTranslatedTitle(item)}
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
