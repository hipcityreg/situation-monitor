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
		if (change >= 2) return 'up-3';
		if (change >= 1) return 'up-2';
		if (change >= 0.5) return 'up-1';
		if (change >= 0) return 'up-0';
		if (change >= -0.5) return 'down-0';
		if (change >= -1) return 'down-1';
		if (change >= -2) return 'down-2';
		return 'down-3';
	}

	const changeText = $derived(formatPercentChange(sector.changePercent));
</script>

<div class="heatmap-cell {colorClass}">
	<div class="sector-name">{sector.name}</div>
	{#if showSymbol}
		<div class="sector-symbol">{sector.symbol}</div>
	{/if}
	<div class="sector-change">{changeText}</div>
</div>

<style>
	.heatmap-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 2px;
		text-align: center;
		min-height: 3rem;
		transition: transform 0.15s ease;
		border: 1px solid transparent;
	}

	.heatmap-cell:hover {
		transform: scale(1.02);
		border-color: var(--accent-border);
	}

	.sector-name {
		font-size: 0.6rem;
		font-weight: 700;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.sector-symbol {
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: rgba(255, 255, 255, 0.7);
		margin-top: 0.1rem;
	}

	.sector-change {
		font-size: 0.5625rem;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
		margin-top: 0.2rem;
	}

	/* Emerald/Success color gradient for positive */
	.up-3 {
		background: rgb(5, 150, 105); /* emerald-600 */
	}
	.up-2 {
		background: rgb(16, 185, 129); /* emerald-500 */
	}
	.up-1 {
		background: rgb(52, 211, 153); /* emerald-400 */
	}
	.up-0 {
		background: rgb(110, 231, 183); /* emerald-300 */
	}

	/* Red/Critical color gradient for negative */
	.down-0 {
		background: rgb(252, 165, 165); /* red-300 */
	}
	.down-1 {
		background: rgb(248, 113, 113); /* red-400 */
	}
	.down-2 {
		background: rgb(239, 68, 68); /* red-500 */
	}
	.down-3 {
		background: rgb(220, 38, 38); /* red-600 */
	}
</style>
