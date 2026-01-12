<script lang="ts">
	import { Panel } from '$lib/components/common';

	interface Prediction {
		id: string;
		question: string;
		yes: number;
		volume: number | string;
		url?: string;
	}

	interface Props {
		predictions?: Prediction[];
		loading?: boolean;
		error?: string | null;
	}

	let { predictions = [], loading = false, error = null }: Props = $props();

	const count = $derived(predictions.length);

	function formatVolume(v: number | string): string {
		if (typeof v === 'string') return '$' + v;
		if (!v) return '$0';
		if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
		if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
		return '$' + v.toFixed(0);
	}
</script>

<Panel id="polymarket" title="Polymarket" {count} {loading} {error}>
	{#if predictions.length === 0 && !loading && !error}
		<div class="text-center text-slate-400 text-xs py-4">No predictions available</div>
	{:else}
		<div class="flex flex-col">
			{#each predictions as pred (pred.id)}
				<div
					class="flex justify-between items-center py-2 border-b border-slate-800 last:border-b-0 hover:bg-white/5 transition-colors"
				>
					<div class="flex-1 min-w-0 mr-2">
						<div class="text-xs font-bold text-white leading-tight mb-0.5">{pred.question}</div>
						<div class="text-[10px] font-mono text-slate-500">Vol: {formatVolume(pred.volume)}</div>
					</div>
					<div class="ml-2">
						<span class="text-xs font-mono text-emerald-500 font-bold tabular-nums"
							>{pred.yes}%</span
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>
