<script lang="ts">
	import { Panel } from '$lib/components/common';

	interface Contract {
		agency: string;
		description: string;
		vendor: string;
		amount: number;
	}

	interface Props {
		contracts?: Contract[];
		loading?: boolean;
		error?: string | null;
	}

	let { contracts = [], loading = false, error = null }: Props = $props();

	const count = $derived(contracts.length);

	function formatValue(v: number): string {
		if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
		if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
		if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
		return '$' + v.toFixed(0);
	}
</script>

<Panel id="contracts" title="Gov Contracts" {count} {loading} {error}>
	{#if contracts.length === 0 && !loading && !error}
		<div class="text-center text-slate-400 text-xs py-4">No contracts available</div>
	{:else}
		<div class="flex flex-col">
			{#each contracts as contract, i (contract.vendor + i)}
				<div
					class="py-2 border-b border-slate-800 last:border-b-0 hover:bg-white/5 transition-colors"
				>
					<div class="text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1">
						{contract.agency}
					</div>
					<div class="text-xs text-white leading-tight mb-1.5">
						{contract.description.length > 100
							? contract.description.substring(0, 100) + '...'
							: contract.description}
					</div>
					<div class="flex justify-between items-center">
						<span class="text-[10px] font-mono text-slate-500">{contract.vendor}</span>
						<span class="text-xs font-mono text-emerald-500 tabular-nums"
							>{formatValue(contract.amount)}</span
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>
