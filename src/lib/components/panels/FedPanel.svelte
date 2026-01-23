<script lang="ts">
	import type { EconomicIndicator } from '$lib/api/fred';
	import { isFredConfigured } from '$lib/api/fred';
	import { Badge, Panel } from '$lib/components/common';
	import { fedIndicators, fedNews, fedVideos } from '$lib/stores';
	import { getRelativeTime } from '$lib/utils';

	// Store state
	const newsState = $derived($fedNews);
	const indicatorsState = $derived($fedIndicators);
	const videoItems = $derived($fedVideos);

	const loading = $derived(newsState.loading || indicatorsState.loading);
	const error = $derived(newsState.error || indicatorsState.error);
	const hasApiKey = isFredConfigured();

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
</script>

<Panel id="fed" title="Federal Reserve" count={newsState.items.length} {loading} {error}>
	<!-- Economic Indicators -->
	{#if hasApiKey && indicatorList.length > 0}
		<div class="indicators-section">
			<div class="indicator-cards">
				{#each indicatorList as indicator (indicator.seriesId)}
					<div class="indicator-card">
						<div class="indicator-label">{indicator.name}</div>
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
			<span class="no-api-key-text">Add VITE_FRED_API_KEY for economic indicators</span>
		</div>
	{/if}

	<!-- Video/Speeches Section -->
	{#if videoItems.length > 0}
		<div class="video-section">
			<div class="section-header">
				<span class="section-title">Speeches & Video</span>
				<a
					href="https://www.federalreserve.gov/live-broadcast.htm"
					target="_blank"
					rel="noopener noreferrer"
					class="live-link"
				>
					Live Broadcast
				</a>
			</div>
			<div class="video-list">
				{#each videoItems.slice(0, 3) as item (item.id)}
					<a href={item.link} target="_blank" rel="noopener noreferrer" class="video-item">
						<div class="video-icon">&#9658;</div>
						<div class="video-content">
							<div class="video-title">{item.title}</div>
							<div class="video-meta">
								{#if item.isPowellRelated}
									<Badge text="POWELL" variant="warning" />
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
			<div class="empty-state">No Fed news available</div>
		{:else}
			<div class="fed-news-list">
				{#each newsState.items.slice(0, 10) as item (item.id)}
					<div class="fed-news-item" class:powell={item.isPowellRelated}>
						<div class="fed-news-header">
							<div class="fed-news-badges">
								<Badge text={item.typeLabel} variant={getTypeVariant(item.type)} />
								{#if item.isPowellRelated && item.type !== 'powell'}
									<Badge text="POWELL" variant="warning" />
								{/if}
								{#if item.hasVideo}
									<Badge text="VIDEO" variant="info" />
								{/if}
							</div>
							{#if item.pubDate}
								<span class="fed-news-time">{getRelativeTime(item.pubDate)}</span>
							{/if}
						</div>
						<a href={item.link} target="_blank" rel="noopener noreferrer" class="fed-news-title">
							{item.title}
						</a>
						{#if item.description}
							<div class="fed-news-desc">
								{item.description.slice(0, 120)}{item.description.length > 120 ? '...' : ''}
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
