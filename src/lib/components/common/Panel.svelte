<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PanelId } from '$lib/config';
	import { settings } from '$lib/stores/settings';
	import { _ } from 'svelte-i18n';

	interface Props {
		id: PanelId;
		title: string;
		count?: number | string | null;
		status?: string;
		statusClass?: string;
		loading?: boolean;
		error?: string | null;
		draggable?: boolean;
		resizable?: boolean;
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
		resizable = true,
		collapsible = false,
		collapsed = false,
		onCollapse,
		header,
		actions,
		children
	}: Props = $props();

	// Min/max height constraints
	const MIN_HEIGHT = 60;
	const MAX_HEIGHT = 600;
	const DEFAULT_HEIGHT = 200;

	// Height state - reactive to settings changes
	let localHeight = $state<number | null>(null);
	let isResizing = $state(false);
	let startY = $state(0);
	let startHeight = $state(0);

	// Get height from settings store (reactive)
	const settingsHeight = $derived($settings.sizes[id]?.height ?? null);
	
	// Use local height during resize, otherwise use settings
	const panelHeight = $derived(isResizing ? localHeight : settingsHeight);

	function handleCollapse() {
		if (collapsible && onCollapse) {
			onCollapse();
		}
	}

	// Start resizing
	function handleResizeStart(e: MouseEvent) {
		if (!resizable) return;
		e.preventDefault();
		e.stopPropagation();
		
		isResizing = true;
		startY = e.clientY;
		startHeight = settingsHeight ?? DEFAULT_HEIGHT;
		localHeight = startHeight;
		
		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
		document.body.style.cursor = 'ns-resize';
		document.body.style.userSelect = 'none';
	}

	// Handle resize movement
	function handleResizeMove(e: MouseEvent) {
		if (!isResizing) return;
		
		const deltaY = e.clientY - startY;
		const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + deltaY));
		localHeight = newHeight;
	}

	// End resizing and save
	function handleResizeEnd() {
		if (!isResizing) return;
		
		const finalHeight = localHeight;
		isResizing = false;
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		
		// Save to settings
		if (finalHeight !== null) {
			settings.updateSize(id, { height: finalHeight });
		}
		localHeight = null;
	}

	// Reset height to default
	function handleResetHeight() {
		settings.updateSize(id, { height: undefined });
	}

	// Double-click to reset
	function handleResizeDoubleClick() {
		handleResetHeight();
	}

	// Expand to max height
	function handleExpand() {
		settings.updateSize(id, { height: MAX_HEIGHT });
	}

	// Minimize to min height
	function handleMinimize() {
		settings.updateSize(id, { height: MIN_HEIGHT });
	}

	// Check if expanded or minimized
	const isExpanded = $derived(panelHeight === MAX_HEIGHT);
	const isMinimized = $derived(panelHeight === MIN_HEIGHT);
</script>

<div 
	class="panel" 
	class:draggable 
	class:collapsed 
	class:resizing={isResizing}
	data-panel-id={id}
	style={panelHeight ? `--panel-height: ${panelHeight}px` : ''}
>
	<div class="panel-header">
		<div class="panel-title-row">
			{#if draggable}
				<span class="drag-handle" title={$_('common.dragToReorder')}>⋮⋮</span>
			{/if}
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
			{#if resizable}
				<button 
					class="panel-size-btn" 
					class:active={isMinimized}
					onclick={handleMinimize} 
					title={$_('common.minimize')}
				>
					▁
				</button>
				<button 
					class="panel-size-btn" 
					onclick={handleResetHeight} 
					title={$_('common.resetHeight')}
				>
					▬
				</button>
				<button 
					class="panel-size-btn"
					class:active={isExpanded}
					onclick={handleExpand} 
					title={$_('common.expand')}
				>
					▆
				</button>
			{/if}
			{#if collapsible}
				<button class="panel-collapse-btn" onclick={handleCollapse} aria-label="Toggle panel">
					{collapsed ? '▼' : '▲'}
				</button>
			{/if}
		</div>
	</div>

	<div 
		class="panel-content" 
		class:hidden={collapsed}
		class:has-custom-height={panelHeight !== null}
	>
		{#if error}
			<div class="error-msg">{error}</div>
		{:else if loading}
			<div class="loading-msg">{$_('common.loading')}</div>
		{:else}
			{@render children()}
		{/if}
	</div>

	{#if resizable && !collapsed}
		<div 
			class="resize-handle"
			onmousedown={handleResizeStart}
			ondblclick={handleResizeDoubleClick}
			title={$_('common.resizePanel')}
		>
			<span class="resize-grip">⋯</span>
		</div>
	{/if}
</div>

<style>
	.panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.panel.resizing {
		user-select: none;
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
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		min-height: 2rem;
	}

	.panel-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.drag-handle {
		color: var(--text-muted);
		font-size: 0.7rem;
		cursor: grab;
		user-select: none;
		opacity: 0.4;
		transition: opacity 0.15s, color 0.15s;
		letter-spacing: -0.1em;
	}

	.drag-handle:hover {
		opacity: 1;
		color: var(--accent);
	}

	.panel:active .drag-handle {
		cursor: grabbing;
	}

	.panel-title {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		margin: 0;
	}

	.panel-count {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--accent);
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
		color: var(--text-secondary);
		background: rgba(255, 255, 255, 0.05);
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

	.panel-size-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.15rem 0.25rem;
		font-size: 0.5rem;
		line-height: 1;
		opacity: 0.5;
		transition: opacity 0.15s, color 0.15s;
		border-radius: 2px;
	}

	.panel-size-btn:hover {
		opacity: 1;
		color: var(--accent);
	}

	.panel-size-btn.active {
		opacity: 1;
		color: var(--accent);
		background: rgba(var(--accent-rgb, 0, 136, 255), 0.15);
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

	.panel-content.has-custom-height {
		height: var(--panel-height, auto);
		flex: none;
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

	/* Resize handle */
	.resize-handle {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 8px;
		cursor: ns-resize;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transition: background 0.15s;
		z-index: 5;
	}

	.resize-handle:hover {
		background: rgba(var(--accent-rgb, 0, 136, 255), 0.1);
	}

	.resize-handle:active {
		background: rgba(var(--accent-rgb, 0, 136, 255), 0.2);
	}

	.resize-grip {
		font-size: 0.6rem;
		color: var(--text-muted);
		opacity: 0;
		transition: opacity 0.15s;
		user-select: none;
	}

	.panel:hover .resize-grip {
		opacity: 0.5;
	}

	.resize-handle:hover .resize-grip {
		opacity: 1;
		color: var(--accent);
	}
</style>
