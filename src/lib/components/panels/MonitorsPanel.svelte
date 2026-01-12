<script lang="ts">
	import { Panel, Badge } from '$lib/components/common';
	import { timeAgo } from '$lib/utils';
	import type { CustomMonitor } from '$lib/types';
	import type { MonitorMatch } from '$lib/stores/monitors';

	interface Props {
		monitors?: CustomMonitor[];
		matches?: MonitorMatch[];
		loading?: boolean;
		error?: string | null;
		onCreateMonitor?: () => void;
		onEditMonitor?: (monitor: CustomMonitor) => void;
		onDeleteMonitor?: (id: string) => void;
		onToggleMonitor?: (id: string) => void;
	}

	let {
		monitors = [],
		matches = [],
		loading = false,
		error = null,
		onCreateMonitor,
		onEditMonitor,
		onDeleteMonitor,
		onToggleMonitor
	}: Props = $props();

	const activeMonitors = $derived(monitors.filter((m) => m.enabled));
	const count = $derived(matches.length);

	function getMatchesForMonitor(monitorId: string): MonitorMatch[] {
		return matches.filter((m) => m.monitor.id === monitorId).slice(0, 3);
	}
</script>

<Panel id="monitors" title="Custom Monitors" {count} {loading} {error}>
	<div class="monitors-content">
		{#if monitors.length === 0 && !loading && !error}
			<div class="empty-state">
				<p>No monitors configured</p>
				{#if onCreateMonitor}
					<button class="create-btn" onclick={onCreateMonitor}> + CREATE MONITOR </button>
				{/if}
			</div>
		{:else}
			<div class="monitors-header">
				<span class="active-count">{activeMonitors.length} ACTIVE</span>
				{#if onCreateMonitor}
					<button class="add-btn" onclick={onCreateMonitor}>+</button>
				{/if}
			</div>

			<div class="monitors-list">
				{#each monitors as monitor (monitor.id)}
					<div class="monitor-item" class:disabled={!monitor.enabled}>
						<div class="monitor-header">
							<div class="monitor-info">
								{#if monitor.color}
									<span
										class="monitor-color"
										style="background: {monitor.color}; box-shadow: 0 0 8px {monitor.color}"
									></span>
								{/if}
								<span class="monitor-name">{monitor.name}</span>
								{#if monitor.matchCount > 0}
									<Badge text={String(monitor.matchCount)} variant="info" />
								{/if}
							</div>
							<div class="monitor-actions">
								{#if onToggleMonitor}
									<button
										class="action-btn"
										class:active={monitor.enabled}
										onclick={() => onToggleMonitor?.(monitor.id)}
										title={monitor.enabled ? 'Disable' : 'Enable'}
									>
										{monitor.enabled ? '●' : '○'}
									</button>
								{/if}
								{#if onEditMonitor}
									<button class="action-btn" onclick={() => onEditMonitor?.(monitor)} title="Edit">
										✎
									</button>
								{/if}
								{#if onDeleteMonitor}
									<button
										class="action-btn delete"
										onclick={() => onDeleteMonitor?.(monitor.id)}
										title="Delete"
									>
										×
									</button>
								{/if}
							</div>
						</div>

						<div class="monitor-keywords">
							{#each monitor.keywords.slice(0, 5) as keyword}
								<span class="keyword">{keyword}</span>
							{/each}
							{#if monitor.keywords.length > 5}
								<span class="keyword more">+{monitor.keywords.length - 5}</span>
							{/if}
						</div>

						{#if monitor.location}
							<div class="monitor-location">
								📍 {monitor.location.name}
							</div>
						{/if}

						{#if getMatchesForMonitor(monitor.id).length > 0}
							<div class="monitor-matches">
								{#each getMatchesForMonitor(monitor.id) as match}
									<div class="match-item">
										<a
											href={match.item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="match-title"
										>
											{match.item.title.length > 80
												? match.item.title.substring(0, 80) + '...'
												: match.item.title}
										</a>
										<div class="match-meta">
											<span class="match-keyword">"{match.matchedKeywords.join(', ')}"</span>
											<span class="match-time">{timeAgo(match.item.timestamp)}</span>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Panel>

<style>
	.monitors-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.monitors-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid var(--border-divider);
	}

	.active-count {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-dim);
		letter-spacing: 0.1em;
	}

	.add-btn {
		width: 1.2rem;
		height: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 2px;
		color: var(--text-dim);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.add-btn:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
		color: var(--accent);
	}

	.monitors-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.monitor-item {
		padding: 0.5rem;
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: 2px;
		transition: border-color 0.15s;
	}

	.monitor-item:hover {
		border-color: var(--accent-border);
	}

	.monitor-item.disabled {
		opacity: 0.5;
	}

	.monitor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.3rem;
	}

	.monitor-info {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.monitor-color {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.monitor-name {
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.monitor-actions {
		display: flex;
		gap: 0.2rem;
	}

	.action-btn {
		width: 1rem;
		height: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--text-muted);
		font-size: 0.65rem;
		cursor: pointer;
		border-radius: 2px;
		transition: all 0.15s;
	}

	.action-btn:hover {
		background: var(--surface-hover);
		color: var(--text-primary);
	}

	.action-btn.active {
		color: var(--success);
	}

	.action-btn.delete:hover {
		color: var(--danger);
	}

	.monitor-keywords {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
		margin-bottom: 0.3rem;
	}

	.keyword {
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		padding: 0.1rem 0.3rem;
		background: var(--interactive-bg);
		border: 1px solid var(--border);
		border-radius: 2px;
		color: var(--text-secondary);
	}

	.keyword.more {
		color: var(--text-muted);
	}

	.monitor-location {
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
		margin-bottom: 0.3rem;
	}

	.monitor-matches {
		border-top: 1px solid var(--border-divider);
		padding-top: 0.3rem;
		margin-top: 0.2rem;
	}

	.match-item {
		padding: 0.2rem 0;
	}

	.match-title {
		display: block;
		font-size: 0.5625rem;
		color: var(--text);
		text-decoration: none;
		line-height: 1.3;
		transition: color 0.15s;
	}

	.match-title:hover {
		color: var(--accent);
	}

	.match-meta {
		display: flex;
		justify-content: space-between;
		margin-top: 0.1rem;
	}

	.match-keyword {
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--warning);
	}

	.match-time {
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
	}

	.empty-state {
		text-align: center;
		padding: 1rem;
	}

	.empty-state p {
		color: var(--text-dim);
		font-size: 0.65rem;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.create-btn {
		padding: 0.4rem 0.8rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 2px;
		color: var(--text-dim);
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.15s;
	}

	.create-btn:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
