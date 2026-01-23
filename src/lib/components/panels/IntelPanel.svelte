<script lang="ts">
	import { Panel, Badge } from '$lib/components/common';
	import { getRelativeTime } from '$lib/utils';
	import { intelNews } from '$lib/stores';
	import { settings } from '$lib/stores/settings';
	import { translate } from '$lib/services/translation';
	import type { NewsItem } from '$lib/types';
	import { _ } from 'svelte-i18n';

	type SourceType = 'osint' | 'govt' | 'think-tank' | 'defense' | 'regional' | 'cyber';

	interface IntelItem {
		id: string;
		title: string;
		translatedTitle?: string;
		link: string;
		source: string;
		sourceType: SourceType;
		regions: string[];
		topics: string[];
		pubDate?: string;
		isPriority?: boolean;
	}

	// Destructure store state for cleaner access
	const { items: storeItems, loading, error } = $derived($intelNews);

	// Translation settings
	const currentLocale = $derived(settings.getLocale());
	const autoTranslate = $derived(settings.getAutoTranslate());
	const shouldTranslate = $derived(currentLocale === 'zh' && autoTranslate);

	// Track translated titles - use object for better reactivity
	let translations = $state<Record<string, string>>({});
	let pending = $state<Record<string, boolean>>({});

	// Infer source type from source name
	function inferSourceType(source: string): SourceType {
		const s = source.toLowerCase();
		if (s.includes('cisa') || s.includes('krebs') || s.includes('cyber')) return 'cyber';
		if (s.includes('bellingcat')) return 'osint';
		if (s.includes('defense') || s.includes('war') || s.includes('military')) return 'defense';
		if (s.includes('diplomat') || s.includes('monitor')) return 'regional';
		if (s.includes('white house') || s.includes('fed') || s.includes('sec') || s.includes('dod'))
			return 'govt';
		return 'think-tank';
	}

	// Transform NewsItem to IntelItem
	function transformToIntelItem(item: NewsItem): IntelItem {
		return {
			id: item.id,
			title: item.title,
			translatedTitle: translations[item.id],
			link: item.link,
			source: item.source,
			sourceType: inferSourceType(item.source),
			regions: item.region ? [item.region] : [],
			topics: item.topics || [],
			pubDate: item.pubDate,
			isPriority: item.isAlert
		};
	}

	const items = $derived(storeItems.map(transformToIntelItem));
	const count = $derived(items.length);

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
		if (!shouldTranslate || storeItems.length === 0) return;

		// Collect all items to translate
		const toTranslate: Array<{ id: string; title: string }> = [];
		
		for (const item of storeItems) {
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

	type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

	const SOURCE_BADGE_VARIANTS: Record<string, BadgeVariant> = {
		osint: 'info',
		govt: 'warning',
		cyber: 'danger'
	};

	function getSourceBadgeVariant(type: string): BadgeVariant {
		return SOURCE_BADGE_VARIANTS[type] ?? 'default';
	}

	// Translate source type
	function getSourceTypeLabel(type: SourceType): string {
		const key = `intel.sourceTypes.${type}`;
		const translated = $_(key);
		return translated === key ? type.toUpperCase() : translated;
	}

	// Translate region
	function getRegionLabel(region: string): string {
		const key = `intel.regions.${region.toUpperCase()}`;
		const translated = $_(key);
		return translated === key ? region : translated;
	}

	// Translate topic
	function getTopicLabel(topic: string): string {
		const key = `intel.topics.${topic.toUpperCase()}`;
		const translated = $_(key);
		return translated === key ? topic : translated;
	}
</script>

<Panel id="intel" title={$_('panels.intel')} {count} {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">{$_('common.noData')}</div>
	{:else}
		<div class="intel-list">
			{#each items as item (item.id)}
				<div class="intel-item" class:priority={item.isPriority}>
					<div class="intel-header">
						<span class="intel-source">{item.source}</span>
						<div class="intel-tags">
							<Badge
								text={getSourceTypeLabel(item.sourceType)}
								variant={getSourceBadgeVariant(item.sourceType)}
							/>
							{#each item.regions.slice(0, 2) as region}
								<Badge text={getRegionLabel(region)} variant="info" />
							{/each}
							{#each item.topics.slice(0, 2) as topic}
								<Badge text={getTopicLabel(topic)} />
							{/each}
						</div>
					</div>
				<a href={item.link} target="_blank" rel="noopener noreferrer" class="intel-title">
					{shouldTranslate && item.translatedTitle ? item.translatedTitle : item.title}
				</a>
					{#if item.pubDate}
						<div class="intel-meta">
							<span>{getRelativeTime(item.pubDate)}</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.intel-list {
		display: flex;
		flex-direction: column;
	}

	.intel-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.intel-item:last-child {
		border-bottom: none;
	}

	.intel-item.priority {
		background: rgba(255, 165, 0, 0.08);
		margin: 0 -0.5rem;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid rgba(255, 165, 0, 0.2);
	}

	.intel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.3rem;
		gap: 0.5rem;
	}

	.intel-source {
		font-size: 0.55rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.intel-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
	}

	.intel-title {
		display: block;
		font-size: 0.65rem;
		color: var(--text-primary);
		text-decoration: none;
		line-height: 1.35;
	}

	.intel-title:hover {
		color: var(--accent);
	}

	.intel-meta {
		margin-top: 0.25rem;
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
