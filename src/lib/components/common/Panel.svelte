<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PanelId } from '$lib/config';

	interface Props {
		id: PanelId;
		title: string;
		count?: number | string | null;
		status?: string;
		statusClass?: string;
		loading?: boolean;
		error?: string | null;
		draggable?: boolean;
		collapsible?: boolean;
		collapsed?: boolean;
		onCollapse?: () => void;
		header?: Snippet;
		actions?: Snippet;
		children: Snippet;
	}

	let {
		id,
		title,
		count = null,
		status = '',
		statusClass = '',
		loading = false,
		error = null,
		draggable = true,
		collapsible = false,
		collapsed = false,
		onCollapse,
		header,
		actions,
		children
	}: Props = $props();

	function handleCollapse() {
		if (collapsible && onCollapse) {
			onCollapse();
		}
	}
</script>

<div class="panel" class:draggable class:collapsed data-panel-id={id}>
	<div class="panel-header">
		<div class="panel-title-row">
			<h3 class="panel-title">{title}</h3>
			{#if count !== null}
				<span class="panel-count">{count}</span>
			{/if}
			{#if status}
				<span class="panel-status {statusClass}">{status}</span>
			{/if}
			{#if loading}
				<span class="panel-loading"></span>
			{/if}
		</div>

		{#if header}
			{@render header()}
		{/if}

		<div class="panel-actions">
			{#if actions}
				{@render actions()}
			{/if}
			{#if collapsible}
				<button class="panel-collapse-btn" onclick={handleCollapse} aria-label="Toggle panel">
					{collapsed ? '▼' : '▲'}
				</button>
			{/if}
		</div>
	</div>

	<div class="panel-content" class:hidden={collapsed}>
		{#if error}
			<div class="error-msg">{error}</div>
		{:else if loading}
			<div class="loading-msg">Loading...</div>
		{:else}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.panel.draggable {
		cursor: grab;
	}

	.panel.draggable:active {
		cursor: grabbing;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: var(--panel-header-bg);
		border-bottom: 1px solid var(--border);
		min-height: 2rem;
	}

	.panel-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-title {
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--panel-header-text);
		margin: 0;
	}

	.panel-count {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--panel-header-text);
		background: rgba(var(--accent-rgb), 0.1);
		padding: 0.1rem 0.4rem;
		border-radius: 3px;
	}

	.panel-status {
		font-size: 0.6rem;
		font-weight: 600;
		padding: 0.1rem 0.4rem;
		border-radius: 3px;
		text-transform: uppercase;
	}

	.panel-status.monitoring {
		color: #ffffff;
		background: var(--blue);
	}

	.panel-status.elevated {
		color: #ffa500;
		background: rgba(255, 165, 0, 0.15);
	}

	.panel-status.critical {
		color: #ff4444;
		background: rgba(255, 68, 68, 0.15);
	}

	.panel-loading {
		width: 12px;
		height: 12px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.panel-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.panel-collapse-btn {
		background: none;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 0.25rem;
		font-size: 0.5rem;
		line-height: 1;
	}

	.panel-collapse-btn:hover {
		color: var(--text-primary);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.panel-content.hidden {
		display: none;
	}

	.error-msg {
		color: var(--danger);
		text-align: center;
		padding: 1rem;
		font-size: 0.7rem;
	}

	.loading-msg {
		color: var(--text-secondary);
		text-align: center;
		padding: 1rem;
		font-size: 0.7rem;
	}
</style>
