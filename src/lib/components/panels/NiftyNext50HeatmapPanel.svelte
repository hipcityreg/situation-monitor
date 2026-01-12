<script lang="ts">
	import { Panel, StockHeatmapCell } from '$lib/components/common';
	import { niftyNext50 } from '$lib/stores';

	const items = $derived($niftyNext50.items);
	const loading = $derived($niftyNext50.loading);
	const error = $derived($niftyNext50.error);
</script>

<Panel id="niftynext50" title="Nifty Next 50 Heatmap" {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">No Nifty Next 50 data available</div>
	{:else}
		<div class="heatmap-grid">
			{#each items as stock (stock.symbol)}
				<StockHeatmapCell {stock} />
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.heatmap-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}

	@media (max-width: 768px) {
		.heatmap-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (max-width: 480px) {
		.heatmap-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
