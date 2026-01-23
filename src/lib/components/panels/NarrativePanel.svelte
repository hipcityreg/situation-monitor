<script lang="ts">
	import { Panel, Badge } from '$lib/components/common';
	import { analyzeNarratives } from '$lib/analysis/narrative';
	import type { NewsItem } from '$lib/types';
	import { _ } from 'svelte-i18n';

	interface Props {
		news?: NewsItem[];
		loading?: boolean;
		error?: string | null;
	}

	let { news = [], loading = false, error = null }: Props = $props();

	const analysis = $derived(analyzeNarratives(news));

	function getStatusVariant(status: string): 'default' | 'warning' | 'danger' | 'success' | 'info' {
		switch (status) {
			case 'viral':
				return 'danger';
			case 'spreading':
				return 'warning';
			case 'emerging':
				return 'info';
			case 'crossing':
				return 'warning';
			default:
				return 'default';
		}
	}

	function getSeverityVariant(
		severity: string
	): 'default' | 'warning' | 'danger' | 'success' | 'info' {
		switch (severity) {
			case 'high':
				return 'danger';
			case 'medium':
				return 'warning';
			default:
				return 'default';
		}
	}
</script>

<Panel id="narrative" title={$_('panels.narrative')} {loading} {error}>
	{#if news.length === 0 && !loading && !error}
		<div class="empty-state">{$_('analysis.insufficientData')}</div>
	{:else if analysis}
		<div class="narrative-content">
			{#if analysis.emergingFringe.length > 0}
				<div class="section">
					<div class="section-title">{$_('analysis.emergingFringe')}</div>
					{#each analysis.emergingFringe.slice(0, 4) as narrative}
						<div class="narrative-item">
							<div class="narrative-header">
								<span class="narrative-name">{narrative.name}</span>
								<Badge
									text={narrative.status.toUpperCase()}
									variant={getStatusVariant(narrative.status)}
								/>
							</div>
							<div class="narrative-meta">
								<span class="mention-count">{narrative.count} {$_('analysis.mentions')}</span>
							</div>
							{#if narrative.sources.length > 0}
								<div class="narrative-sources">
									{narrative.sources.slice(0, 3).join(' · ')}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			{#if analysis.fringeToMainstream.length > 0}
				<div class="section">
					<div class="section-title">{$_('analysis.fringeMainstream')}</div>
					{#each analysis.fringeToMainstream.slice(0, 3) as crossover}
						<div class="crossover-item">
							<div class="crossover-narrative">{crossover.name}</div>
							<div class="crossover-path">
								<span class="from">{$_('analysis.fringe')} ({crossover.fringeCount})</span>
								<span class="arrow">→</span>
								<span class="to">{$_('analysis.mainstream')} ({crossover.mainstreamCount})</span>
							</div>
							<div class="crossover-level">
								{$_('analysis.crossoverLevel')}: {Math.round(crossover.crossoverLevel * 100)}%
							</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if analysis.narrativeWatch.length > 0}
				<div class="section">
					<div class="section-title">{$_('analysis.narrativeWatch')}</div>
					<div class="themes-grid">
						{#each analysis.narrativeWatch.slice(0, 6) as narrative}
							<div class="theme-tag">
								{narrative.name}
								<span class="theme-count">{narrative.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if analysis.disinfoSignals.length > 0}
				<div class="section">
					<div class="section-title">{$_('analysis.disinfoSignals')}</div>
					{#each analysis.disinfoSignals.slice(0, 3) as signal}
						<div class="disinfo-item">
							<div class="disinfo-header">
								<span class="disinfo-name">{signal.name}</span>
								<Badge
									text={signal.severity.toUpperCase()}
									variant={getSeverityVariant(signal.severity)}
								/>
							</div>
							<div class="disinfo-meta">{signal.count} {$_('analysis.mentions')}</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if analysis.emergingFringe.length === 0 && analysis.fringeToMainstream.length === 0}
				<div class="empty-state">{$_('analysis.noNarrativesDetected')}</div>
			{/if}
		</div>
	{:else}
		<div class="empty-state">{$_('analysis.noNarrativesDetected')}</div>
	{/if}
</Panel>

<style>
	.narrative-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section {
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.section:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.section-title {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.4rem;
	}

	.narrative-item {
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--border);
	}

	.narrative-item:last-child {
		border-bottom: none;
	}

	.narrative-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.2rem;
	}

	.narrative-name {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.narrative-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.15rem;
	}

	.mention-count {
		font-size: 0.55rem;
		color: var(--text-secondary);
	}

	.narrative-sources {
		font-size: 0.5rem;
		color: var(--text-muted);
	}

	.crossover-item {
		padding: 0.35rem 0;
		border-left: 2px solid var(--warning);
		padding-left: 0.5rem;
		margin: 0.25rem 0;
	}

	.crossover-narrative {
		font-size: 0.6rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.crossover-path {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.55rem;
		margin: 0.15rem 0;
	}

	.crossover-path .from {
		color: var(--text-secondary);
	}

	.crossover-path .arrow {
		color: var(--warning);
	}

	.crossover-path .to {
		color: var(--success);
	}

	.crossover-level {
		font-size: 0.5rem;
		color: var(--text-muted);
	}

	.themes-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.theme-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 0.4rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		font-size: 0.55rem;
		color: var(--text-secondary);
	}

	.theme-count {
		font-size: 0.5rem;
		color: var(--text-muted);
		background: rgba(255, 255, 255, 0.1);
		padding: 0.1rem 0.2rem;
		border-radius: 2px;
	}

	.disinfo-item {
		padding: 0.3rem 0;
	}

	.disinfo-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.disinfo-name {
		font-size: 0.6rem;
		color: var(--text-primary);
	}

	.disinfo-meta {
		font-size: 0.5rem;
		color: var(--text-muted);
		margin-top: 0.1rem;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
