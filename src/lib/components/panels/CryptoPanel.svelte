<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { crypto } from '$lib/stores';
	import { formatCurrency, formatPercentChange } from '$lib/utils';

	const items = $derived($crypto.items);
	const loading = $derived($crypto.loading);
	const error = $derived($crypto.error);
	const count = $derived(items.length);
</script>

<Panel id="whales" title="Crypto" {count} {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="text-center text-slate-500 text-[10px] uppercase tracking-widest py-4">
			No crypto data available
		</div>
	{:else}
		<div class="flex flex-col">
			{#each items as coin, i (coin.id)}
				{@const isPositive = coin.price_change_percentage_24h >= 0}
				<div
					class="flex justify-between items-center py-2 px-1 hover:bg-white/5 transition-colors {i < items.length - 1 ? 'border-b border-slate-800' : ''}"
				>
					<div class="flex flex-col gap-0.5">
						<div class="text-xs font-bold text-white">{coin.name}</div>
						<div class="text-[10px] font-mono text-slate-400">{coin.symbol.toUpperCase()}</div>
					</div>
					<div class="flex flex-col items-end gap-0.5">
						<div class="text-xs font-mono text-slate-200 tabular-nums">
							{formatCurrency(coin.current_price)}
						</div>
						<div
							class="text-[10px] font-mono tabular-nums {isPositive ? 'text-emerald-500' : 'text-red-500'}"
						>
							{formatPercentChange(coin.price_change_percentage_24h)}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>
