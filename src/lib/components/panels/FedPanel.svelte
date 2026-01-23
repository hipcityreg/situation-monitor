<script lang="ts">
	import { Panel, Badge } from '$lib/components/common';
	import { getRelativeTime } from '$lib/utils';
	import { fedNews, fedIndicators, fedVideos } from '$lib/stores';
	import { settings } from '$lib/stores/settings';
	import { isFredConfigured } from '$lib/api/fred';
	import type { EconomicIndicator } from '$lib/api/fred';
	import { translate } from '$lib/services/translation';
	import { _ } from 'svelte-i18n';

	// Store state
	const newsState = $derived($fedNews);
	const indicatorsState = $derived($fedIndicators);
	const videoItems = $derived($fedVideos);

	const loading = $derived(newsState.loading || indicatorsState.loading);
	const error = $derived(newsState.error || indicatorsState.error);
	const hasApiKey = isFredConfigured();

	// Translation settings
	const currentLocale = $derived(settings.getLocale());
	const autoTranslate = $derived(settings.getAutoTranslate());
	const shouldTranslate = $derived(currentLocale === 'zh' && autoTranslate);

	// Track translations
	let translations = $state<Record<string, string>>({});
	let pending = $state<Record<string, boolean>>({});

	// Map indicator series ID to i18n key
	const INDICATOR_KEYS: Record<string, string> = {
		FEDFUNDS: 'fed.indicators.fedFundsRate',
		CPIAUCSL: 'fed.indicators.cpiInflation',
		DGS10: 'fed.indicators.treasury10Y'
	};

	// Get translated indicator name
	function getIndicatorName(indicator: EconomicIndicator): string {
		const key = INDICATOR_KEYS[indicator.seriesId];
		if (key) {
			const translated = $_(key);
			if (translated !== key) return translated;
		}
		return indicator.name;
	}

	const indicatorList = $derived(
		indicatorsState.data
			? [
					indicatorsState.data.fedFundsRate,
					indicatorsState.data.cpi,
					indicatorsState.data.treasury10Y
				]
			: []
	);

	type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

	const TYPE_VARIANTS: Record<string, BadgeVariant> = {
		powell: 'warning',
		monetary: 'danger',
		speech: 'info',
		testimony: 'success',
		announcement: 'default'
	};

	function formatValue(indicator: EconomicIndicator): string {
		if (indicator.value === null) return '--';
		return `${indicator.value.toFixed(2)}${indicator.unit}`;
	}

	function formatChange(indicator: EconomicIndicator): string {
		if (indicator.change === null) return '';
		const sign = indicator.change >= 0 ? '+' : '';
		return `${sign}${indicator.change.toFixed(2)}`;
	}

	function getChangeClass(change: number | null): string {
		if (change === null) return '';
		if (change > 0) return 'up';
		if (change < 0) return 'down';
		return '';
	}

	function getTypeVariant(type: string): BadgeVariant {
		return TYPE_VARIANTS[type] || 'default';
	}

	// Get translated type label
	function getTypeLabel(type: string): string {
		const key = `fed.types.${type}`;
		const translated = $_(key);
		return translated === key ? type.charAt(0).toUpperCase() + type.slice(1) : translated;
	}

	// Get translated badge text
	function getBadgeText(badge: 'powell' | 'video'): string {
		const key = `fed.badges.${badge}`;
		const translated = $_(key);
		return translated === key ? badge.toUpperCase() : translated;
	}

	// Translate a news item
	async function translateItem(id: string, text: string) {
		if (translations[id] || pending[id]) return;

		pending = { ...pending, [id]: true };

		try {
			const translated = await translate(text, 'zh');
			translations = { ...translations, [id]: translated };
		} catch {
			// Keep original on error
		} finally {
			const { [id]: _, ...rest } = pending;
			pending = rest;
		}
	}

	// Translate news and videos when needed
	$effect(() => {
		if (!shouldTranslate) return;

		// Translate news items
		let delay = 0;
		for (const item of newsState.items) {
			if (!translations[item.id] && !pending[item.id]) {
				setTimeout(() => translateItem(item.id, item.title), delay);
				delay += 200;
			}
			// Also translate description
			const descKey = `${item.id}-desc`;
			if (item.description && !translations[descKey] && !pending[descKey]) {
				setTimeout(() => translateItem(descKey, item.description), delay);
				delay += 200;
			}
		}

		// Translate video items
		for (const item of videoItems) {
			if (!translations[item.id] && !pending[item.id]) {
				setTimeout(() => translateItem(item.id, item.title), delay);
				delay += 200;
			}
		}
	});

	// Get translated title
	function getTitle(id: string, original: string): string {
		return shouldTranslate && translations[id] ? translations[id] : original;
	}
</script>

<Panel id="fed" title={$_('panels.fed')} count={newsState.items.length} {loading} {error}>
	<!-- Economic Indicators -->
	{#if hasApiKey && indicatorList.length > 0}
		<div class="indicators-section">
			<div class="indicator-cards">
				{#each indicatorList as indicator (indicator.seriesId)}
					<div class="indicator-card">
						<div class="indicator-label">{getIndicatorName(indicator)}</div>
						<div class="indicator-value">{formatValue(indicator)}</div>
						<div class="indicator-change {getChangeClass(indicator.change)}">
							{formatChange(indicator)}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if !hasApiKey && !loading}
		<div class="no-api-key">
			<span class="no-api-key-text">{$_('fed.addApiKey')}</span>
		</div>
	{/if}

	<!-- Video/Speeches Section -->
	{#if videoItems.length > 0}
		<div class="video-section">
			<div class="section-header">
				<span class="section-title">{$_('fed.speechesVideo')}</span>
				<a
					href="https://www.federalreserve.gov/live-broadcast.htm"
					target="_blank"
					rel="noopener noreferrer"
					class="live-link"
				>
					{$_('fed.liveBroadcast')}
				</a>
			</div>
			<div class="video-list">
				{#each videoItems.slice(0, 3) as item (item.id)}
					<a href={item.link} target="_blank" rel="noopener noreferrer" class="video-item">
						<div class="video-icon">&#9658;</div>
						<div class="video-content">
							<div class="video-title">{getTitle(item.id, item.title)}</div>
							<div class="video-meta">
								{#if item.isPowellRelated}
									<Badge text={getBadgeText('powell')} variant="warning" />
								{/if}
								<span>{getRelativeTime(item.pubDate)}</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- News Feed -->
	<div class="news-section">
		{#if newsState.items.length === 0 && !loading && !error}
			<div class="empty-state">{$_('common.noData')}</div>
		{:else}
			<div class="fed-news-list">
				{#each newsState.items as item (item.id)}
					{@const title = getTitle(item.id, item.title)}
					{@const desc = item.description ? getTitle(`${item.id}-desc`, item.description) : ''}
					<div class="fed-news-item" class:powell={item.isPowellRelated}>
						<div class="fed-news-header">
							<div class="fed-news-badges">
								<Badge text={getTypeLabel(item.type)} variant={getTypeVariant(item.type)} />
								{#if item.isPowellRelated && item.type !== 'powell'}
									<Badge text={getBadgeText('powell')} variant="warning" />
								{/if}
								{#if item.hasVideo}
									<Badge text={getBadgeText('video')} variant="info" />
								{/if}
							</div>
							{#if item.pubDate}
								<span class="fed-news-time">{getRelativeTime(item.pubDate)}</span>
							{/if}
						</div>
						<a href={item.link} target="_blank" rel="noopener noreferrer" class="fed-news-title">
							{title}
						</a>
						{#if desc}
							<div class="fed-news-desc">
								{desc.slice(0, 120)}{desc.length > 120 ? '...' : ''}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Panel>

<style>
	/* Indicators Section */
	.indicators-section {
		padding-bottom: 0.5rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.indicator-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.indicator-card {
		text-align: center;
		padding: 0.4rem;
		background: var(--bg-secondary);
		border-radius: 4px;
	}

	.indicator-label {
		font-size: 0.5rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		margin-bottom: 0.2rem;
	}

	.indicator-value {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.indicator-change {
		font-size: 0.55rem;
		font-weight: 500;
	}

	.indicator-change.up {
		color: var(--success);
	}

	.indicator-change.down {
		color: var(--danger);
	}

	.no-api-key {
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		background: var(--bg-secondary);
		border-radius: 4px;
		text-align: center;
	}

	.no-api-key-text {
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	/* Video Section */
	.video-section {
		padding-bottom: 0.5rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.4rem;
	}

	.section-title {
		font-size: 0.55rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.live-link {
		font-size: 0.5rem;
		color: var(--danger);
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.live-link::before {
		content: '';
		width: 6px;
		height: 6px;
		background: var(--danger);
		border-radius: 50%;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.live-link:hover {
		text-decoration: underline;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	.video-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.video-item {
		display: flex;
		gap: 0.5rem;
		padding: 0.4rem;
		background: var(--bg-secondary);
		border-radius: 4px;
		text-decoration: none;
		transition: background 0.15s;
	}

	.video-item:hover {
		background: var(--bg-tertiary, var(--border));
	}

	.video-icon {
		color: var(--danger);
		font-size: 0.7rem;
		flex-shrink: 0;
		width: 1.2rem;
		height: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.1);
		border-radius: 4px;
	}

	.video-content {
		flex: 1;
		min-width: 0;
	}

	.video-title {
		font-size: 0.6rem;
		color: var(--text-primary);
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.video-meta {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.2rem;
		font-size: 0.5rem;
		color: var(--text-muted);
	}

	/* News Section */
	.news-section {
		flex: 1;
	}

	.fed-news-list {
		display: flex;
		flex-direction: column;
	}

	.fed-news-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.fed-news-item:last-child {
		border-bottom: none;
	}

	.fed-news-item.powell {
		background: rgba(255, 165, 0, 0.08);
		margin: 0 -0.5rem;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid rgba(255, 165, 0, 0.2);
	}

	.fed-news-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.3rem;
		gap: 0.5rem;
	}

	.fed-news-badges {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.fed-news-time {
		font-size: 0.5rem;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.fed-news-title {
		display: block;
		font-size: 0.65rem;
		color: var(--text-primary);
		text-decoration: none;
		line-height: 1.35;
	}

	.fed-news-title:hover {
		color: var(--accent);
	}

	.fed-news-desc {
		margin-top: 0.25rem;
		font-size: 0.55rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
