<script lang="ts">
	import type { NiftyStock } from '$lib/types';
	import { formatPercentChange } from '$lib/utils';

	interface Props {
		stock: NiftyStock;
	}

	let { stock }: Props = $props();

	const colorClass = $derived(getColorClass(stock.changePercent));

	function getColorClass(change: number): string {
		if (isNaN(change)) return 'neutral';
		if (change >= 2) return 'up-3';
		if (change >= 1) return 'up-2';
		if (change >= 0.5) return 'up-1';
		if (change >= 0) return 'up-0';
		if (change >= -0.5) return 'down-0';
		if (change >= -1) return 'down-1';
		if (change >= -2) return 'down-2';
		return 'down-3';
	}

	const changeText = $derived(formatPercentChange(stock.changePercent));

	// Extract symbol without .NS suffix for display
	const displaySymbol = $derived(stock.symbol.replace('.NS', ''));
</script>

<div class="stock-cell {colorClass}">
	<div class="logo-container">
		<img src={stock.logoUrl} alt={stock.name} class="logo" loading="lazy" />
	</div>
	<div class="stock-symbol">{displaySymbol}</div>
	<div class="stock-change">{changeText}</div>
</div>

<style>
	.stock-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.4rem;
		border-radius: 4px;
		text-align: center;
		min-height: 4rem;
		transition:
			transform 0.15s ease,
			background-color 0.3s ease;
		gap: 0.2rem;
	}

	.stock-cell:hover {
		transform: scale(1.05);
		z-index: 10;
	}

	.logo-container {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.logo {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.stock-symbol {
		font-size: 0.55rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.stock-change {
		font-size: 0.5rem;
		font-weight: 500;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
	.neutral {
		background: #666666;
	}

	@media (max-width: 400px) {
		.stock-cell {
			min-height: 3.5rem;
			padding: 0.3rem;
		}

		.logo-container {
			width: 28px;
			height: 28px;
		}

		.stock-symbol {
			font-size: 0.5rem;
		}

		.stock-change {
			font-size: 0.45rem;
		}
	}
</style>
