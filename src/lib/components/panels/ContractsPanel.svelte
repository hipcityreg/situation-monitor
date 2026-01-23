<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { _ } from 'svelte-i18n';

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

<Panel id="contracts" title={$_('panels.contracts')} {count} {loading} {error}>
	{#if contracts.length === 0 && !loading && !error}
		<div class="empty-state">{$_('common.noData')}</div>
	{:else}
		<div class="contracts-list">
			{#each contracts as contract, i (contract.vendor + i)}
				<div class="contract-item">
					<div class="contract-agency">{contract.agency}</div>
					<div class="contract-desc">
						{contract.description.length > 100
							? contract.description.substring(0, 100) + '...'
							: contract.description}
					</div>
					<div class="contract-meta">
						<span class="contract-vendor">{contract.vendor}</span>
						<span class="contract-value">{formatValue(contract.amount)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.contracts-list {
		display: flex;
		flex-direction: column;
	}

	.contract-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.contract-item:last-child {
		border-bottom: none;
	}

	.contract-agency {
		font-size: 0.55rem;
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		margin-bottom: 0.2rem;
	}

	.contract-desc {
		font-size: 0.65rem;
		color: var(--text-primary);
		line-height: 1.3;
		margin-bottom: 0.3rem;
	}

	.contract-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.contract-vendor {
		font-size: 0.55rem;
		color: var(--text-secondary);
	}

	.contract-value {
		font-size: 0.65rem;
		font-weight: 600;
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
