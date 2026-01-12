<script lang="ts">
	import type { NewsItem } from '$lib/types';
	import { timeAgo } from '$lib/utils';

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
		{item.title}
	</a>

	{#if showDescription && item.description}
		<p class="item-description">{item.description}</p>
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
		border-bottom: 1px solid var(--border-divider);
		transition: background-color 0.15s;
	}

	.news-item:last-child {
		border-bottom: none;
	}

	.news-item.compact {
		padding: 0.35rem 0;
	}

	.news-item.alert {
		background: var(--critical-bg);
		margin: 0 -0.5rem;
		padding: 0.5rem;
		border-radius: 2px;
		border: 1px solid var(--critical-border);
		border-bottom: 1px solid var(--critical-border);
	}

	.item-source {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
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
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.item-title {
		display: block;
		font-size: 0.7rem;
		line-height: 1.35;
		color: var(--text);
		text-decoration: none;
		transition: color 0.15s;
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
		border-left: 2px solid var(--border-default);
		padding-left: 0.5rem;
	}

	.item-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.item-time {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
	}

	.item-region {
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--accent);
		background: rgba(34, 211, 238, 0.1);
		padding: 0.1rem 0.375rem;
		border-radius: 2px;
		border: 1px solid var(--accent-border);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
