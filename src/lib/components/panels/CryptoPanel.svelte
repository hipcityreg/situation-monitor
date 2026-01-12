<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { crypto } from '$lib/stores';
	import { formatCurrency, formatPercentChange, getChangeClass } from '$lib/utils';

	const items = $derived($crypto.items);
	const loading = $derived($crypto.loading);
	const error = $derived($crypto.error);
	const count = $derived(items.length);
</script>

<Panel id="whales" title="Crypto" {count} {loading} {error}>
	{#if items.length === 0 && !loading && !error}
		<div class="empty-state">No crypto data available</div>
	{:else}
		<div class="crypto-list">
			{#each items as coin (coin.id)}
				{@const changeClass = getChangeClass(coin.price_change_percentage_24h)}
				<div class="crypto-item">
					<div class="crypto-info">
						<div class="crypto-name">{coin.name}</div>
						<div class="crypto-symbol">{coin.symbol.toUpperCase()}</div>
					</div>
					<div class="crypto-data">
						<div class="crypto-price">{formatCurrency(coin.current_price)}</div>
						<div class="crypto-change {changeClass}">
							{formatPercentChange(coin.price_change_percentage_24h)}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.crypto-list {
		display: flex;
		flex-direction: column;
	}

	.crypto-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border-divider);
	}

	.crypto-item:last-child {
		border-bottom: none;
	}

	.crypto-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.crypto-name {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.crypto-symbol {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.crypto-data {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.1rem;
	}

	.crypto-price {
		font-size: 0.7rem;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.crypto-change {
		font-size: 0.625rem;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		font-variant-numeric: tabular-nums;
		padding: 0.1rem 0.25rem;
		border-radius: 2px;
	}

	.crypto-change.up {
		color: var(--success);
		background: var(--success-bg);
	}

	.crypto-change.down {
		color: var(--danger);
		background: var(--critical-bg);
	}

	.empty-state {
		text-align: center;
		color: var(--text-dim);
		font-size: 0.65rem;
		padding: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>
