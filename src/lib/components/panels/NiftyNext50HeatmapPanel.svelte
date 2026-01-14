<script lang="ts">
	import { Panel, StockHeatmapCell } from '$lib/components/common';
	import { niftyNext50 } from '$lib/stores';

	const items = $derived($niftyNext50.items);
	const loading = $derived($niftyNext50.loading);
	const error = $derived($niftyNext50.error);
	const lastUpdated = $derived($niftyNext50.lastUpdated);

	// Format time since last update
	function formatTimeSince(timestamp: number | null): string {
		if (!timestamp) return 'Never';
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h ago`;
	}

	const lastUpdateText = $derived(formatTimeSince(lastUpdated));
</script>

<Panel id="niftynext50" title="Nifty Next 50 Heatmap" {loading} {error} status={lastUpdateText}>
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
