<script lang="ts">
	import { Panel, MarketItem } from '$lib/components/common';
	import { indices } from '$lib/stores';

	const items = $derived($indices.items);
	const loading = $derived($indices.loading);
	const error = $derived($indices.error);
	const count = $derived(items.length);
</script>

<Panel id="markets" title="Markets" {count} {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="text-center text-slate-400 text-xs py-4">No market data available</div>
	{:else}
		<div class="flex flex-col">
			{#each items as item (item.symbol)}
				<MarketItem {item} />
			{/each}
		</div>
	{/if}
</Panel>
