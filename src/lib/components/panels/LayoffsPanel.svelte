<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { timeAgo } from '$lib/utils';

	interface Layoff {
		company: string;
		count?: string | number;
		title: string;
		date: string;
	}

	interface Props {
		layoffs?: Layoff[];
		loading?: boolean;
		error?: string | null;
	}

	let { layoffs = [], loading = false, error = null }: Props = $props();

	const count = $derived(layoffs.length);
</script>

<Panel id="layoffs" title="Layoffs Tracker" {count} {loading} {error}>
	{#if layoffs.length === 0 && !loading && !error}
		<div class="text-center text-slate-400 text-xs py-4">No recent layoffs data</div>
	{:else}
		<div class="flex flex-col">
			{#each layoffs as layoff, i (layoff.company + i)}
				<div
					class="py-2 border-b border-slate-800 last:border-b-0 hover:bg-white/5 transition-colors"
				>
					<div class="text-xs font-bold text-white mb-0.5">{layoff.company}</div>
					{#if layoff.count}
						<div class="text-xs font-mono text-red-500 tabular-nums mb-1">
							{typeof layoff.count === 'string'
								? parseInt(layoff.count).toLocaleString()
								: layoff.count.toLocaleString()} jobs
						</div>
					{/if}
					<div class="flex justify-between items-start gap-2">
						<span class="text-[10px] text-slate-400 leading-tight flex-1">{layoff.title}</span>
						<span class="text-[10px] font-mono text-slate-500 whitespace-nowrap"
							>{timeAgo(layoff.date)}</span
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>
