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
	<!-- Tech Corner Decorations -->
	<div class="tech-corner top-left"></div>
	<div class="tech-corner top-right"></div>
	<div class="tech-corner bottom-left"></div>
	<div class="tech-corner bottom-right"></div>

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
		/* Glass morphism effect */
		background: var(--surface);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--border);
		border-radius: 2px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		position: relative;
		isolation: isolate;
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
	}

	.panel.draggable {
		cursor: grab;
	}

	.panel.draggable:active {
		cursor: grabbing;
	}

	/* Tech Corner Decorations */
	.tech-corner {
		position: absolute;
		width: 8px;
		height: 8px;
		pointer-events: none;
		z-index: 10;
	}

	.tech-corner.top-left {
		top: 0;
		left: 0;
		border-top: 2px solid var(--accent-border);
		border-left: 2px solid var(--accent-border);
	}

	.tech-corner.top-right {
		top: 0;
		right: 0;
		border-top: 2px solid var(--accent-border);
		border-right: 2px solid var(--accent-border);
	}

	.tech-corner.bottom-left {
		bottom: 0;
		left: 0;
		border-bottom: 2px solid var(--accent-border);
		border-left: 2px solid var(--accent-border);
	}

	.tech-corner.bottom-right {
		bottom: 0;
		right: 0;
		border-bottom: 2px solid var(--accent-border);
		border-right: 2px solid var(--accent-border);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: var(--surface-solid);
		border-bottom: 1px solid var(--border-divider);
		min-height: 2rem;
	}

	.panel-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-title {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--text-primary);
		margin: 0;
	}

	.panel-count {
		font-size: 0.625rem;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--accent);
		background: rgba(34, 211, 238, 0.1);
		padding: 0.1rem 0.4rem;
		border-radius: 2px;
		border: 1px solid var(--accent-border);
	}

	.panel-status {
		font-size: 0.625rem;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		padding: 0.1rem 0.4rem;
		border-radius: 2px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border: 1px solid;
	}

	.panel-status.monitoring {
		color: var(--text-dim);
		background: rgba(100, 116, 139, 0.1);
		border-color: var(--border);
	}

	.panel-status.elevated {
		color: var(--warning);
		background: var(--warning-bg);
		border-color: var(--warning-border);
	}

	.panel-status.critical {
		color: var(--danger);
		background: var(--critical-bg);
		border-color: var(--critical-border);
	}

	.panel-loading {
		width: 12px;
		height: 12px;
		border: 2px solid var(--border-default);
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
		color: var(--text-dim);
		cursor: pointer;
		padding: 0.25rem;
		font-size: 0.5rem;
		line-height: 1;
		transition: color 0.15s;
	}

	.panel-collapse-btn:hover {
		color: var(--accent);
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
		font-family: 'SF Mono', Monaco, monospace;
	}

	.loading-msg {
		color: var(--text-dim);
		text-align: center;
		padding: 1rem;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>
