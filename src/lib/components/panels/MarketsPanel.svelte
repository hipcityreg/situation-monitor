<script lang="ts">
	import { Panel, MarketItem } from '$lib/components/common';
	import { indices, t } from '$lib/stores';

	const items = $derived($indices.items);
	const loading = $derived($indices.loading);
	const error = $derived($indices.error);
	const count = $derived(items.length);
</script>

<Panel id="markets" title={$t('panels.markets.name')} {count} {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">{$t('panels.markets.empty')}</div>
	{:else}
		<div class="markets-list">
			{#each items as item (item.symbol)}
				<MarketItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.markets-list {
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
