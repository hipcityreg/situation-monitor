<script lang="ts">
	import { Panel, Badge } from '$lib/components/common';
	import { analyzeCorrelations } from '$lib/analysis/correlation';
	import type { NewsItem } from '$lib/types';

	interface Props {
		news?: NewsItem[];
		loading?: boolean;
		error?: string | null;
	}

	let { news = [], loading = false, error = null }: Props = $props();

	const analysis = $derived(analyzeCorrelations(news));

	function getLevelVariant(level: string): 'default' | 'warning' | 'danger' | 'success' | 'info' {
		switch (level) {
			case 'high':
				return 'danger';
			case 'elevated':
				return 'warning';
			case 'surging':
				return 'danger';
			case 'rising':
				return 'warning';
			default:
				return 'default';
		}
	}

	function getMomentumClass(momentum: string): string {
		switch (momentum) {
			case 'surging':
				return 'signal-strong';
			case 'rising':
				return 'signal-medium';
			default:
				return 'signal-weak';
		}
	}

	function getDirectionArrow(delta: number): string {
		if (delta > 0) return '↑';
		if (delta < 0) return '↓';
		return '→';
	}
</script>

<Panel id="correlation" title="Pattern Analysis" {loading} {error}>
	{#if news.length === 0 && !loading && !error}
		<div class="empty-state">Insufficient data for analysis</div>
	{:else if analysis}
		<div class="correlation-content">
			{#if analysis.emergingPatterns.length > 0}
				<div class="section">
					<div class="section-title">Emerging Patterns</div>
					{#each analysis.emergingPatterns.slice(0, 3) as pattern}
						<div class="pattern-item">
							<div class="pattern-header">
								<span class="pattern-topic">{pattern.name}</span>
								<Badge
									text={pattern.level.toUpperCase()}
									variant={getLevelVariant(pattern.level)}
								/>
							</div>
							<div class="pattern-sources">
								{pattern.sources.slice(0, 3).join(' · ')} ({pattern.count} items)
							</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if analysis.momentumSignals.length > 0}
				<div class="section">
					<div class="section-title">Momentum Signals</div>
					{#each analysis.momentumSignals.slice(0, 3) as signal}
						<div class="signal-item {getMomentumClass(signal.momentum)}">
							<span class="signal-topic">{signal.name}</span>
							<span
								class="signal-direction"
								class:up={signal.delta > 0}
								class:down={signal.delta < 0}
							>
								{getDirectionArrow(signal.delta)}
								{signal.current}
							</span>
						</div>
					{/each}
				</div>
			{/if}

			{#if analysis.crossSourceCorrelations.length > 0}
				<div class="section">
					<div class="section-title">Cross-Source Links</div>
					{#each analysis.crossSourceCorrelations.slice(0, 3) as corr}
						<div class="correlation-item">
							<div class="correlation-sources">
								{corr.sources.slice(0, 2).join(' ↔ ')}
							</div>
							<div class="correlation-topic">{corr.name} ({corr.sourceCount} sources)</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if analysis.predictiveSignals.length > 0}
				<div class="section">
					<div class="section-title">Predictive Signals</div>
					{#each analysis.predictiveSignals.slice(0, 2) as signal}
						<div class="predictive-item">
							<div class="predictive-pattern">{signal.prediction}</div>
							<div class="predictive-confidence">
								Confidence: {Math.round(signal.confidence * 100)}%
							</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if analysis.emergingPatterns.length === 0 && analysis.momentumSignals.length === 0}
				<div class="empty-state">No significant patterns detected</div>
			{/if}
		</div>
	{:else}
		<div class="empty-state">No significant patterns detected</div>
	{/if}
</Panel>

<style>
	.correlation-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section {
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-divider);
	}

	.section:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.section-title {
		font-size: 0.5625rem;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		margin-bottom: 0.4rem;
	}

	.pattern-item {
		padding: 0.3rem 0;
	}

	.pattern-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.2rem;
	}

	.pattern-topic {
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.pattern-sources {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
	}

	.signal-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0.4rem;
		margin: 0.2rem 0;
		border-radius: 2px;
		background: var(--card-bg);
		border-left: 2px solid transparent;
	}

	.signal-item.signal-strong {
		background: var(--warning-bg);
		border-left-color: var(--warning);
	}

	.signal-item.signal-medium {
		background: var(--success-bg);
		border-left-color: var(--success);
	}

	.signal-topic {
		font-size: 0.625rem;
		color: var(--text-primary);
	}

	.signal-direction {
		font-size: 0.625rem;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
	}

	.signal-direction.up {
		color: var(--success);
	}

	.signal-direction.down {
		color: var(--danger);
	}

	.correlation-item {
		padding: 0.25rem 0;
	}

	.correlation-sources {
		font-size: 0.625rem;
		color: var(--text-secondary);
	}

	.correlation-topic {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
	}

	.predictive-item {
		padding: 0.3rem 0;
	}

	.predictive-pattern {
		font-size: 0.625rem;
		color: var(--text-primary);
	}

	.predictive-confidence {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
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
