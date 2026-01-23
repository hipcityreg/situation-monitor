<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { _ } from 'svelte-i18n';

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

<Panel id="polymarket" title={$_('panels.polymarket')} {count} {loading} {error}>
	{#if predictions.length === 0 && !loading && !error}
		<div class="empty-state">{$_('common.noData')}</div>
	{:else}
		<div class="predictions-list">
			{#each predictions as pred (pred.id)}
				<div class="prediction-item">
					<div class="prediction-info">
						<div class="prediction-question">{pred.question}</div>
						<div class="prediction-volume">Vol: {formatVolume(pred.volume)}</div>
					</div>
					<div class="prediction-odds">
						<span class="prediction-yes">{pred.yes}%</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.predictions-list {
		display: flex;
		flex-direction: column;
	}

	.prediction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.prediction-item:last-child {
		border-bottom: none;
	}

	.prediction-info {
		flex: 1;
		min-width: 0;
	}

	.prediction-question {
		font-size: 0.65rem;
		color: var(--text-primary);
		line-height: 1.3;
		margin-bottom: 0.2rem;
	}

	.prediction-volume {
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.prediction-odds {
		margin-left: 0.5rem;
	}

	.prediction-yes {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--success);
		font-variant-numeric: tabular-nums;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
