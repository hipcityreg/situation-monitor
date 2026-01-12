<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PanelId } from '$lib/config';
	import { panelLayout, draggedPanelId } from '$lib/stores';

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

	// Drag state
	const isBeingDragged = $derived($draggedPanelId === id);

	function handleCollapse() {
		if (collapsible && onCollapse) {
			onCollapse();
		}
	}

	// Drag handlers
	function handleDragStart(event: DragEvent) {
		if (!draggable) return;

		panelLayout.startDrag(id);

		// Set drag data
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', id);

			// Create a custom drag image
			const dragImage = document.createElement('div');
			dragImage.textContent = title;
			dragImage.style.cssText = `
				position: absolute;
				top: -1000px;
				padding: 8px 16px;
				background: rgb(15 23 42 / 0.95);
				border: 1px solid rgb(34 211 238);
				border-radius: 2px;
				color: rgb(34 211 238);
				font-size: 12px;
				font-weight: bold;
				text-transform: uppercase;
				letter-spacing: 0.1em;
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
			`;
			document.body.appendChild(dragImage);
			event.dataTransfer.setDragImage(dragImage, 50, 20);

			// Clean up drag image after a short delay
			setTimeout(() => dragImage.remove(), 0);
		}
	}

	function handleDragEnd() {
		panelLayout.endDrag();
	}
</script>

<div
	class="panel"
	class:draggable
	class:collapsed
	class:dragging={isBeingDragged}
	data-panel-id={id}
	draggable={draggable ? 'true' : 'false'}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	role={draggable ? 'listitem' : undefined}
>
	<!-- Tech Corner Decorations -->
	<div class="tech-corner top-left"></div>
	<div class="tech-corner top-right"></div>
	<div class="tech-corner bottom-left"></div>
	<div class="tech-corner bottom-right"></div>

	<div class="panel-header" class:drag-handle={draggable}>
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
			<div class="error-state">
				<span class="error-icon">⚠</span>
				<div class="error-msg">{error}</div>
				<div class="error-hint">Check connection or refresh</div>
			</div>
		{:else if loading}
			<div class="loading-state">
				<div class="loading-spinner-small"></div>
				<div class="loading-msg">FETCHING DATA</div>
			</div>
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

	.panel.dragging {
		opacity: 0.5;
		transform: scale(0.98);
		border-color: rgb(34 211 238); /* cyan-400 */
		box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
	}

	.drag-handle {
		cursor: grab;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	/* Drag grip indicator */
	.drag-handle::before {
		content: '⋮⋮';
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		color: rgb(71 85 105); /* slate-600 */
		font-size: 0.625rem;
		letter-spacing: 2px;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.panel.draggable:hover .drag-handle::before {
		opacity: 1;
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

	/* Error State Styling */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1.5rem 1rem;
		text-align: center;
	}

	.error-icon {
		font-size: 1.25rem;
		color: rgb(251 191 36); /* amber-400 */
	}

	.error-msg {
		color: rgb(248 113 113); /* red-400 */
		font-size: 0.625rem; /* 10px */
		font-family: 'SF Mono', Monaco, monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		max-width: 200px;
	}

	.error-hint {
		color: rgb(100 116 139); /* slate-500 */
		font-size: 0.5625rem; /* 9px */
		font-family: 'SF Mono', Monaco, monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Loading State Styling */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 1.5rem 1rem;
	}

	.loading-spinner-small {
		width: 20px;
		height: 20px;
		border: 2px solid rgb(51 65 85); /* slate-700 */
		border-top-color: rgb(34 211 238); /* cyan-400 */
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-msg {
		color: rgb(148 163 184); /* slate-400 */
		text-align: center;
		font-size: 0.5625rem; /* 9px */
		font-family: 'SF Mono', Monaco, monospace;
		text-transform: uppercase;
		letter-spacing: 0.15em;
	}
</style>
