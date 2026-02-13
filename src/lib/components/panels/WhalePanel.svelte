<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { t } from '$lib/stores';

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

<Panel id="whales" title={$t('panels.whales.name')} {count} {loading} {error}>
	{#if whales.length === 0 && !loading && !error}
		<div class="empty-state">{$t('panels.whales.empty')}</div>
	{:else}
		<div class="whale-list">
			{#each whales as whale, i (whale.hash + i)}
				<div class="whale-item">
					<div class="whale-header">
						<span class="whale-coin">{whale.coin}</span>
						<span class="whale-amount data-value">{formatAmount(whale.amount)} {whale.coin}</span>
					</div>
					<div class="whale-flow">
						<span class="whale-usd data-value">{formatUSD(whale.usd)}</span>
						<span class="arrow">→</span>
						<span class="whale-hash">{whale.hash}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.whale-list {
		display: flex;
		flex-direction: column;
	}

	.whale-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.whale-item:last-child {
		border-bottom: none;
	}

	.whale-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.whale-coin {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--accent);
	}

	.whale-amount {
		font-size: 0.65rem;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.whale-flow {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.6rem;
	}

	.whale-usd {
		color: var(--success);
		font-weight: 500;
	}

	.arrow {
		color: var(--text-muted);
	}

	.whale-hash {
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-size: 0.55rem;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
