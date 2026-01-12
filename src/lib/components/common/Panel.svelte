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
		/* Glass morphism effect - Aegis design system */
		background: rgb(2 6 23 / 0.8); /* bg-slate-950/80 */
		backdrop-filter: blur(12px); /* backdrop-blur-md */
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgb(51 65 85 / 0.5); /* border-slate-700/50 */
		border-radius: 2px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		position: relative;
		isolation: isolate;
		/* shadow-2xl */
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
	}

	.panel.draggable {
		cursor: grab;
	}

	.panel.draggable:active {
		cursor: grabbing;
	}

	/* Tech Corner Decorations - using cyan-400/60 per design system */
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
		border-top: 2px solid rgb(34 211 238 / 0.6); /* cyan-400/60 */
		border-left: 2px solid rgb(34 211 238 / 0.6);
	}

	.tech-corner.top-right {
		top: 0;
		right: 0;
		border-top: 2px solid rgb(34 211 238 / 0.6);
		border-right: 2px solid rgb(34 211 238 / 0.6);
	}

	.tech-corner.bottom-left {
		bottom: 0;
		left: 0;
		border-bottom: 2px solid rgb(34 211 238 / 0.6);
		border-left: 2px solid rgb(34 211 238 / 0.6);
	}

	.tech-corner.bottom-right {
		bottom: 0;
		right: 0;
		border-bottom: 2px solid rgb(34 211 238 / 0.6);
		border-right: 2px solid rgb(34 211 238 / 0.6);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem; /* p-2 (8px) per design system */
		background: rgb(15 23 42 / 0.9); /* slate-900/90 */
		border-bottom: 1px solid rgb(51 65 85 / 0.5); /* border-slate-700/50 */
		min-height: 2.5rem;
	}

	.panel-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-title {
		/* text-sm (14px), font-bold, uppercase, tracking-widest per design system */
		font-size: 0.875rem; /* 14px */
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em; /* tracking-widest */
		color: rgb(226 232 240); /* text-slate-200 */
		margin: 0;
	}

	.panel-count {
		/* text-[10px] for metadata per design system */
		font-size: 0.625rem; /* 10px */
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		color: rgb(34 211 238); /* cyan-400 */
		background: rgb(34 211 238 / 0.1); /* cyan-400/10 */
		padding: 0.125rem 0.5rem;
		border-radius: 2px;
		border: 1px solid rgb(34 211 238 / 0.3); /* cyan-400/30 */
	}

	.panel-status {
		/* text-[10px] for metadata per design system */
		font-size: 0.625rem; /* 10px */
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		padding: 0.125rem 0.5rem;
		border-radius: 2px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border: 1px solid;
	}

	.panel-status.monitoring {
		color: rgb(148 163 184); /* slate-400 */
		background: rgb(100 116 139 / 0.1); /* slate-500/10 */
		border-color: rgb(71 85 105 / 0.5); /* slate-600/50 */
	}

	.panel-status.elevated {
		color: rgb(251 191 36); /* amber-400 */
		background: rgb(251 191 36 / 0.1); /* amber-400/10 */
		border-color: rgb(251 191 36 / 0.3); /* amber-400/30 */
	}

	.panel-status.critical {
		color: rgb(248 113 113); /* red-400 */
		background: rgb(248 113 113 / 0.1); /* red-400/10 */
		border-color: rgb(248 113 113 / 0.3); /* red-400/30 */
	}

	.panel-loading {
		width: 14px;
		height: 14px;
		border: 2px solid rgb(51 65 85); /* slate-700 */
		border-top-color: rgb(34 211 238); /* cyan-400 */
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
		gap: 0.375rem;
	}

	.panel-collapse-btn {
		background: none;
		border: none;
		color: rgb(148 163 184); /* slate-400 */
		cursor: pointer;
		padding: 0.25rem;
		font-size: 0.625rem; /* 10px */
		line-height: 1;
		transition: color 0.15s;
	}

	.panel-collapse-btn:hover {
		color: rgb(34 211 238); /* cyan-400 */
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem; /* p-4 (16px) per design system */
		/* text-xs (12px) for content per design system */
		font-size: 0.75rem;
	}

	.panel-content.hidden {
		display: none;
	}

	.error-msg {
		color: rgb(248 113 113); /* red-400 */
		text-align: center;
		padding: 1rem;
		font-size: 0.75rem; /* text-xs (12px) */
		font-family: 'SF Mono', Monaco, monospace;
	}

	.loading-msg {
		color: rgb(148 163 184); /* slate-400 */
		text-align: center;
		padding: 1rem;
		font-size: 0.75rem; /* text-xs (12px) */
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>
