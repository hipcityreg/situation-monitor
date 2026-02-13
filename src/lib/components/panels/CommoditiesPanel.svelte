<script lang="ts">
	import { Panel, MarketItem } from '$lib/components/common';
	import { commodities, vix, t } from '$lib/stores';

	const items = $derived($commodities.items);
	const loading = $derived($commodities.loading);
	const error = $derived($commodities.error);

	// VIX status for panel header - localized
	function getVixStatus(level: number | undefined): string {
		if (level === undefined) return '';
		if (level >= 30) return $t('panels.commodities.vixHigh');
		if (level >= 20) return $t('panels.commodities.vixElevated');
		return $t('panels.commodities.vixLow');
	}
	
	const vixStatus = $derived(getVixStatus($vix?.price));

	function getVixClass(level: number | undefined): string {
		if (level === undefined) return '';
		if (level >= 30) return 'critical';
		if (level >= 20) return 'elevated';
		return 'monitoring';
	}
	
	const vixClass = $derived(getVixClass($vix?.price));
</script>

<Panel
	id="commodities"
	title={$t('panels.commodities.name')}
	status={vixStatus}
	statusClass={vixClass}
	{loading}
	{error}
>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">{$t('panels.commodities.empty')}</div>
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
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
