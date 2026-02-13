<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { treasury, yield2Y, yield10Y, yieldSpread, isYieldCurveInverted, t } from '$lib/stores';

	const data = $derived($treasury.data);
	const loading = $derived($treasury.loading);
	const error = $derived($treasury.error);
	
	// Format yield value with %
	function formatYield(value: number | null | undefined): string {
		if (value === null || value === undefined || isNaN(value)) return '--';
		return `${value.toFixed(2)}%`;
	}
	
	// Format spread with sign
	function formatSpread(value: number | null): string {
		if (value === null || isNaN(value)) return '--';
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}
	
	// Get status color based on inversion
	const statusColor = $derived($isYieldCurveInverted ? 'var(--danger)' : 'var(--success)');
	const statusText = $derived($isYieldCurveInverted ? 'INVERTED ⚠️' : 'NORMAL');
	
	// Historical significance
	const inversionWarning = $derived($isYieldCurveInverted 
		? 'Yield curve inversion historically precedes recessions within 6-18 months'
		: 'Yield curve is positively sloped (normal)'
	);
</script>

<Panel id="yieldcurve" title={$t('panels.yieldcurve.name')} {loading} {error}>
	{#if data}
		<div class="yield-container">
			<!-- Data Source Indicator -->
			<div class="data-source" class:api={data.dataSource === 'api'} class:demo={data.dataSource === 'demo'}>
				{#if data.dataSource === 'api'}
					<span class="badge">LIVE</span>
				{:else}
					<span class="badge">Demo</span>
				{/if}
			</div>
			
			<!-- Main Yield Display -->
			<div class="yield-row">
				<div class="yield-item">
					<div class="yield-label">2-Year</div>
					<div class="yield-value">{formatYield($yield2Y?.value)}</div>
				</div>
				<div class="spread-arrow">
					<span class="arrow">→</span>
				</div>
				<div class="yield-item">
					<div class="yield-label">10-Year</div>
					<div class="yield-value">{formatYield($yield10Y?.value)}</div>
				</div>
			</div>
			
			<!-- Spread Display -->
			<div class="spread-row" style="--status-color: {statusColor}">
				<div class="spread-label">Spread (10Y - 2Y)</div>
				<div class="spread-value">{formatSpread($yieldSpread)}</div>
			</div>
			
			<!-- Status Badge -->
			<div class="status-row">
				<div class="status-badge" class:inverted={$isYieldCurveInverted}>
					{statusText}
				</div>
			</div>
			
			<!-- Historical Context -->
			<div class="context-text">
				{inversionWarning}
			</div>
			
			<!-- Mini Chart Placeholder (could be enhanced with actual sparkline) -->
			<div class="mini-chart">
				<div class="chart-line" class:inverted={$isYieldCurveInverted}></div>
			</div>
		</div>
	{:else}
		<div class="empty-state">{$t('panel.empty')}</div>
	{/if}
</Panel>

<style>
	.yield-container {
		padding: 0.5rem 0;
	}
	
	.data-source {
		display: flex;
		justify-content: center;
		margin-bottom: 0.75rem;
	}
	
	.data-source .badge {
		font-size: 0.5rem;
		padding: 0.15rem 0.4rem;
		border-radius: 3px;
	}
	
	.data-source.api .badge {
		background: rgba(0, 255, 136, 0.2);
		color: var(--success);
	}
	
	.data-source.demo .badge {
		background: rgba(128, 128, 128, 0.2);
		color: gray;
	}
	
	.yield-row {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.yield-item {
		text-align: center;
	}
	
	.yield-label {
		font-size: 0.6rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}
	
	.yield-value {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		font-family: var(--font-mono);
	}
	
	.spread-arrow {
		color: var(--text-muted);
		font-size: 1.2rem;
	}
	
	.spread-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: var(--surface);
		border-radius: 4px;
		margin-bottom: 0.75rem;
		border-left: 3px solid var(--status-color);
	}
	
	.spread-label {
		font-size: 0.65rem;
		color: var(--text-secondary);
	}
	
	.spread-value {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--status-color);
		font-family: var(--font-mono);
	}
	
	.status-row {
		display: flex;
		justify-content: center;
		margin-bottom: 0.75rem;
	}
	
	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: rgba(0, 255, 136, 0.1);
		color: var(--success);
		border: 1px solid rgba(0, 255, 136, 0.3);
	}
	
	.status-badge.inverted {
		background: rgba(255, 68, 68, 0.1);
		color: var(--danger);
		border: 1px solid rgba(255, 68, 68, 0.3);
		animation: pulse 2s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}
	
	.context-text {
		font-size: 0.6rem;
		color: var(--text-muted);
		text-align: center;
		line-height: 1.4;
		padding: 0 0.5rem;
		margin-bottom: 0.75rem;
	}
	
	.mini-chart {
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 1rem;
	}
	
	.chart-line {
		width: 100%;
		height: 2px;
		background: linear-gradient(90deg, var(--success) 0%, var(--success) 100%);
		border-radius: 1px;
		position: relative;
	}
	
	.chart-line::after {
		content: '';
		position: absolute;
		right: 0;
		top: -3px;
		width: 8px;
		height: 8px;
		background: var(--success);
		border-radius: 50%;
	}
	
	.chart-line.inverted {
		background: linear-gradient(90deg, var(--danger) 0%, var(--danger) 100%);
	}
	
	.chart-line.inverted::after {
		background: var(--danger);
	}
	
	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
