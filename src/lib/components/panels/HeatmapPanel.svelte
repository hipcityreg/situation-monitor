<script lang="ts">
	import { Panel, HeatmapCell } from '$lib/components/common';
	import { sectors } from '$lib/stores';

	const items = $derived($sectors.items);
	const loading = $derived($sectors.loading);
	const error = $derived($sectors.error);
</script>

<Panel id="heatmap" title="Sector Heatmap" {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="text-center text-slate-400 text-[11px] p-4">No sector data available</div>
	{:else}
		<div class="grid grid-cols-4 gap-2 max-[400px]:grid-cols-3">
			{#each items as sector (sector.symbol)}
				<HeatmapCell {sector} />
			{/each}
		</div>
	{/if}
</Panel>
