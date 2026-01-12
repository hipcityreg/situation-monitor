<script lang="ts">
	import { Panel, MarketItem } from '$lib/components/common';
	import { commodities, vix } from '$lib/stores';

	const items = $derived($commodities.items);
	const loading = $derived($commodities.loading);
	const error = $derived($commodities.error);

	// VIX status for panel header
	const vixStatus = $derived(getVixStatus($vix?.price));
	const vixClass = $derived(getVixClass($vix?.price));

	function getVixStatus(level: number | undefined): string {
		if (level === undefined) return '';
		if (level >= 30) return 'HIGH FEAR';
		if (level >= 20) return 'ELEVATED';
		return 'LOW';
	}

	function getVixClass(level: number | undefined): string {
		if (level === undefined) return '';
		if (level >= 30) return 'critical';
		if (level >= 20) return 'elevated';
		return 'monitoring';
	}
</script>

<Panel
	id="commodities"
	title="Commodities / VIX"
	status={vixStatus}
	statusClass={vixClass}
	{loading}
	{error}
>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">No commodity data available</div>
	{:else}
		<div class="commodities-list">
			{#each items as item (item.symbol)}
				<MarketItem {item} currencySymbol={item.symbol === '^VIX' ? '' : '$'} />
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.commodities-list {
		display: flex;
		flex-direction: column;
	}

	.empty-state {
		text-align: center;
		color: var(--text-dim);
		font-size: 0.65rem;
		padding: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>
