<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import type { CoreNewsCategory } from '$lib/types';
	import type { PanelId } from '$lib/config';
	import {
		politicsNews,
		techNews,
		securityNews,
		sysadminNews,
		financeNews,
		govNews,
		aiNews,
		intelNews
	} from '$lib/stores';

	interface Props {
		category: CoreNewsCategory;
		panelId: PanelId;
		title: string;
	}

	let { category, panelId, title }: Props = $props();

	// Get the appropriate derived store based on category
	const categoryStores = {
		politics: politicsNews,
		tech: techNews,
		security: securityNews,
		sysadmin: sysadminNews,
		finance: financeNews,
		gov: govNews,
		ai: aiNews,
		intel: intelNews
	};

	const categoryStore = $derived(categoryStores[category]);
	const items = $derived($categoryStore.items);
	const loading = $derived($categoryStore.loading);
	const error = $derived($categoryStore.error);
	const count = $derived(items.length);
</script>

<Panel id={panelId} {title} {count} {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">No news available</div>
	{:else}
		<div class="news-list">
			{#each items.slice(0, 15) as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.news-list {
		display: flex;
		flex-direction: column;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
