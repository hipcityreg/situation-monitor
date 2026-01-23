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
		border-radius: 4px;
		text-align: center;
		min-height: 3rem;
		transition: transform 0.15s ease;
	}

	.heatmap-cell:hover {
		transform: scale(1.02);
	}

	.sector-name {
		font-size: 0.6rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.sector-symbol {
		font-size: 0.5rem;
		color: rgba(255, 255, 255, 0.7);
		margin-top: 0.1rem;
	}

	.sector-change {
		font-size: 0.55rem;
		font-weight: 500;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		margin-top: 0.2rem;
	}

	:global([data-theme='light']) .heatmap-cell .sector-name {
		color: #111827;
		text-shadow: none;
	}

	:global([data-theme='light']) .heatmap-cell .sector-symbol {
		color: #374151;
	}

	:global([data-theme='light']) .heatmap-cell .sector-change {
		color: #111827;
		text-shadow: none;
	}

	/* Color classes */
	.up-3 {
		background: #00aa00;
	}
	.up-2 {
		background: #22bb22;
	}
	.up-1 {
		background: #55cc55;
	}
	.up-0 {
		background: #88dd88;
	}
	.down-0 {
		background: #dd8888;
	}
	.down-1 {
		background: #cc5555;
	}
	.down-2 {
		background: #bb2222;
	}
	.down-3 {
		background: #aa0000;
	}
</style>
