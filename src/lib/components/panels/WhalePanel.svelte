<script lang="ts">
	import { Panel } from '$lib/components/common';

	interface WhaleTransaction {
		coin: string;
		amount: number;
		usd: number;
		hash: string;
	}

	interface Props {
		whales?: WhaleTransaction[];
		loading?: boolean;
		error?: string | null;
	}

	let { whales = [], loading = false, error = null }: Props = $props();

	const count = $derived(whales.length);

	function formatAmount(amt: number): string {
		return amt >= 1000 ? (amt / 1000).toFixed(1) + 'K' : amt.toFixed(2);
	}

	function formatUSD(usd: number): string {
		if (usd >= 1e9) return '$' + (usd / 1e9).toFixed(1) + 'B';
		if (usd >= 1e6) return '$' + (usd / 1e6).toFixed(1) + 'M';
		return '$' + (usd / 1e3).toFixed(0) + 'K';
	}
</script>

<Panel id="whales" title="Whale Watch" {count} {loading} {error}>
	{#if whales.length === 0 && !loading && !error}
		<div class="text-center text-slate-400 text-xs py-4">No whale transactions detected</div>
	{:else}
		<div class="flex flex-col">
			{#each whales as whale, i (whale.hash + i)}
				<div
					class="py-2 border-b border-slate-800 last:border-b-0 hover:bg-white/5 transition-colors"
				>
					<div class="flex justify-between items-center mb-1">
						<span class="text-xs font-bold text-white">{whale.coin}</span>
						<span class="text-xs font-mono text-slate-200 tabular-nums"
							>{formatAmount(whale.amount)} {whale.coin}</span
						>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-[10px] font-mono text-emerald-500">{formatUSD(whale.usd)}</span>
						<span class="text-slate-500">→</span>
						<span class="text-[10px] font-mono text-slate-500">{whale.hash}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>
