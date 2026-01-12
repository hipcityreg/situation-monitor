<script lang="ts">
	import type { SectorPerformance } from '$lib/types';
	import { formatPercentChange } from '$lib/utils';

	interface Props {
		sector: SectorPerformance;
		showSymbol?: boolean;
	}

	let { sector, showSymbol = false }: Props = $props();

	const colorClass = $derived(getColorClass(sector.changePercent));

	function getColorClass(change: number): string {
		// Green gradient for positive values
		if (change >= 2) return 'bg-emerald-600';
		if (change >= 1) return 'bg-emerald-500';
		if (change >= 0.5) return 'bg-emerald-400';
		if (change >= 0) return 'bg-emerald-300';
		// Red gradient for negative values
		if (change >= -0.5) return 'bg-red-300';
		if (change >= -1) return 'bg-red-400';
		if (change >= -2) return 'bg-red-500';
		return 'bg-red-600';
	}

	const changeText = $derived(formatPercentChange(sector.changePercent));
</script>

<div
	class="flex flex-col items-center justify-center p-2 rounded-sm border border-slate-700 text-center min-h-[3rem] transition-all duration-150 hover:brightness-125 {colorClass}"
>
	<div class="text-[10px] font-bold text-white uppercase tracking-wide drop-shadow-sm">
		{sector.name}
	</div>
	{#if showSymbol}
		<div class="text-[10px] font-mono text-white/70 uppercase mt-0.5">
			{sector.symbol}
		</div>
	{/if}
	<div class="text-xs font-mono font-bold text-white drop-shadow-sm mt-0.5">
		{changeText}
	</div>
</div>
