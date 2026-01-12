<script lang="ts">
	import type { MarketItem as MarketItemType } from '$lib/types';
	import { formatPercentChange } from '$lib/utils';

	interface Props {
		item: MarketItemType;
		showSymbol?: boolean;
		showPrice?: boolean;
		compact?: boolean;
		currencySymbol?: string;
	}

	let {
		item,
		showSymbol = true,
		showPrice = true,
		compact = false,
		currencySymbol = '$'
	}: Props = $props();

	const isDataAvailable = $derived(!isNaN(item.price) && item.price !== null);
	const isPositive = $derived(item.changePercent >= 0);
	const priceDisplay = $derived(
		!isDataAvailable
			? '—'
			: item.price > 100
				? item.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
				: item.price.toFixed(2)
	);
	const changeText = $derived(isDataAvailable ? formatPercentChange(item.changePercent) : '—');
</script>

<div
	class="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
	class:py-1.5={compact}
>
	<div class="flex flex-col gap-0.5">
		<div class="text-xs font-bold text-white" class:text-[10px]={compact}>{item.name}</div>
		{#if showSymbol}
			<div class="text-[9px] font-mono text-slate-500 uppercase tracking-wide">{item.symbol}</div>
		{/if}
	</div>

	<div class="flex flex-col items-end gap-0.5">
		{#if showPrice}
			<div
				class="text-xs font-mono text-slate-200 tabular-nums"
				class:text-[10px]={compact}
				class:text-slate-500={!isDataAvailable}
				class:opacity-50={!isDataAvailable}
			>
				{isDataAvailable ? `${currencySymbol}${priceDisplay}` : priceDisplay}
			</div>
		{/if}
		<div
			class="text-[10px] font-mono tabular-nums"
			class:text-emerald-500={isDataAvailable && isPositive}
			class:text-red-500={isDataAvailable && !isPositive}
			class:text-slate-500={!isDataAvailable}
			class:opacity-50={!isDataAvailable}
		>
			{changeText}
		</div>
	</div>
</div>
