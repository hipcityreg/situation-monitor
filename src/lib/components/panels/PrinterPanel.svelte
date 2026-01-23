<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { _ } from 'svelte-i18n';

	interface Props {
		data?: {
			value: number;
			change: number;
			changePercent: number;
			percentOfMax: number;
		} | null;
		loading?: boolean;
		error?: string | null;
	}

	let { data = null, loading = false, error = null }: Props = $props();

	const isExpanding = $derived(data && data.change > 0);
	const status = $derived(isExpanding ? 'PRINTER ON' : 'PRINTER OFF');
	const statusClass = $derived(isExpanding ? 'critical' : 'monitoring');
</script>

<Panel id="printer" title={$_('panels.printer')} {status} {statusClass} {loading} {error}>
	{#if !data && !loading && !error}
		<div class="empty-state">{$_('common.noData')}</div>
	{:else if data}
		<div class="printer-gauge">
			<div class="printer-label">Federal Reserve Balance Sheet</div>
			<div class="printer-value">
				{data.value.toFixed(2)}<span class="printer-unit">T USD</span>
			</div>
			<div class="printer-change" class:up={isExpanding} class:down={!isExpanding}>
				{data.change >= 0 ? '+' : ''}{(data.change * 1000).toFixed(0)}B ({data.changePercent >= 0
					? '+'
					: ''}{data.changePercent.toFixed(2)}%) WoW
			</div>
			<div class="printer-bar">
				<div class="printer-fill" style="width: {Math.min(data.percentOfMax, 100)}%"></div>
			</div>
			<div class="printer-status">
				<span class="printer-indicator" class:on={isExpanding} class:off={!isExpanding}></span>
				{status}
			</div>
		</div>
	{/if}
</Panel>

<style>
	.printer-gauge {
		text-align: center;
		padding: 0.5rem;
	}

	.printer-label {
		font-size: 0.55rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.printer-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.printer-unit {
		font-size: 0.7rem;
		font-weight: 400;
		color: var(--text-secondary);
		margin-left: 0.25rem;
	}

	.printer-change {
		font-size: 0.65rem;
		font-weight: 500;
		margin: 0.25rem 0 0.75rem;
	}

	.printer-change.up {
		color: var(--success);
	}

	.printer-change.down {
		color: var(--danger);
	}

	.printer-bar {
		height: 8px;
		background: var(--border);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.75rem;
	}

	.printer-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--success), var(--accent));
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.printer-status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.printer-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.printer-indicator.on {
		background: var(--success);
		box-shadow: 0 0 8px var(--success);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.printer-indicator.off {
		background: var(--danger);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
