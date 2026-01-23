<script lang="ts">
	import type { NewsItem } from '$lib/types';
	import { timeAgo } from '$lib/utils';
	import { translate } from '$lib/services/translation';
	import { settings } from '$lib/stores/settings';

	interface Props {
		item: NewsItem;
		showSource?: boolean;
		showAlert?: boolean;
		showDescription?: boolean;
		compact?: boolean;
	}

	let {
		item,
		showSource = true,
		showAlert = true,
		showDescription = false,
		compact = false
	}: Props = $props();

	let translatedTitle = $state<string>(item.title);
	let translatedDescription = $state<string>(item.description || '');
	let hasTranslated = $state(false);

	// Derive current settings without triggering on every access
	const currentLocale = $derived(settings.getLocale());
	const autoTranslate = $derived(settings.getAutoTranslate());
	const shouldTranslate = $derived(currentLocale === 'zh' && autoTranslate);

	// Translate when conditions change
	$effect(() => {
		if (shouldTranslate && !hasTranslated) {
			hasTranslated = true;

			// Use requestIdleCallback to avoid blocking the UI
			if (typeof requestIdleCallback !== 'undefined') {
				requestIdleCallback(
					() => {
						translate(item.title, 'zh')
							.then((title) => {
								translatedTitle = title;
							})
							.catch(() => {
								translatedTitle = item.title;
							});
					},
					{ timeout: 2000 }
				);
			} else {
				// Fallback for browsers without requestIdleCallback
				setTimeout(() => {
					translate(item.title, 'zh')
						.then((title) => {
							translatedTitle = title;
						})
						.catch(() => {
							translatedTitle = item.title;
						});
				}, Math.random() * 1000); // Random delay to spread out requests
			}
		} else if (!shouldTranslate) {
			// Reset to original text when switching back to English or disabling translation
			hasTranslated = false;
			translatedTitle = item.title;
			translatedDescription = item.description || '';
		}
	});
</script>

<div class="news-item" class:alert={showAlert && item.isAlert} class:compact>
	{#if showSource}
		<div class="item-source">
			{item.source}
			{#if showAlert && item.isAlert}
				<span class="alert-tag">ALERT</span>
			{/if}
		</div>
	{/if}

	<a class="item-title" href={item.link} target="_blank" rel="noopener noreferrer">
		{translatedTitle}
	</a>

	{#if showDescription && translatedDescription}
		<p class="item-description">{translatedDescription}</p>
	{/if}

	<div class="item-meta">
		<span class="item-time">{timeAgo(item.timestamp)}</span>
		{#if item.region}
			<span class="item-region">{item.region}</span>
		{/if}
	</div>
</div>

<style>
	.news-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.news-item:last-child {
		border-bottom: none;
	}

	.news-item.compact {
		padding: 0.35rem 0;
	}

	.news-item.alert {
		background: rgba(255, 68, 68, 0.08);
		margin: 0 -0.5rem;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid rgba(255, 68, 68, 0.2);
		border-bottom: 1px solid rgba(255, 68, 68, 0.2);
	}

	.item-source {
		font-size: 0.55rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		margin-bottom: 0.2rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.alert-tag {
		background: var(--danger);
		color: white;
		font-size: 0.5rem;
		padding: 0.1rem 0.3rem;
		border-radius: 2px;
		font-weight: 600;
	}

	.item-title {
		display: block;
		font-size: 0.7rem;
		line-height: 1.35;
		color: var(--text-primary);
		text-decoration: none;
	}

	.item-title:hover {
		color: var(--accent);
	}

	.compact .item-title {
		font-size: 0.65rem;
		line-height: 1.3;
	}

	.item-description {
		font-size: 0.6rem;
		color: var(--text-secondary);
		margin: 0.3rem 0 0;
		line-height: 1.4;
	}

	.item-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.item-time {
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.item-region {
		font-size: 0.5rem;
		color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
		padding: 0.1rem 0.3rem;
		border-radius: 2px;
		text-transform: uppercase;
	}
</style>
