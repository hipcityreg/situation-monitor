<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PanelId } from '$lib/config';
	import { settings } from '$lib/stores/settings';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// Drag-drop state
	let draggedPanelId = $state<PanelId | null>(null);
	let dragOverPanelId = $state<PanelId | null>(null);
	let isDragging = $state(false);

	// Handle drag start
	function handleDragStart(e: DragEvent) {
		const target = (e.target as HTMLElement).closest('.panel-slot[data-panel-id]') as HTMLElement;
		if (!target) return;
		
		const panelId = target.getAttribute('data-panel-id') as PanelId;
		if (panelId === 'map') {
			e.preventDefault();
			return;
		}

		draggedPanelId = panelId;
		isDragging = true;
		
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', panelId);
			// Set drag image
			e.dataTransfer.setDragImage(target, 20, 20);
		}

		// Add dragging class after a short delay for visual feedback
		requestAnimationFrame(() => {
			target.classList.add('dragging');
		});
	}

	// Handle drag over
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}

		const target = (e.target as HTMLElement).closest('.panel-slot[data-panel-id]') as HTMLElement;
		if (!target) return;

		const panelId = target.getAttribute('data-panel-id') as PanelId;
		if (panelId !== draggedPanelId && panelId !== 'map') {
			// Remove drag-over from previous target
			if (dragOverPanelId && dragOverPanelId !== panelId) {
				const prevTarget = document.querySelector(`[data-panel-id="${dragOverPanelId}"]`);
				prevTarget?.classList.remove('drag-over');
			}
			dragOverPanelId = panelId;
			target.classList.add('drag-over');
		}
	}

	// Handle drag leave
	function handleDragLeave(e: DragEvent) {
		const target = (e.target as HTMLElement).closest('.panel-slot[data-panel-id]') as HTMLElement;
		if (!target) return;
		
		const relatedTarget = e.relatedTarget as HTMLElement;
		// Only remove class if we're actually leaving the panel
		if (!target.contains(relatedTarget)) {
			target.classList.remove('drag-over');
			const panelId = target.getAttribute('data-panel-id') as PanelId;
			if (panelId === dragOverPanelId) {
				dragOverPanelId = null;
			}
		}
	}

	// Handle drop
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		
		const target = (e.target as HTMLElement).closest('.panel-slot[data-panel-id]') as HTMLElement;
		if (!target || !draggedPanelId) {
			resetDragState();
			return;
		}

		const targetPanelId = target.getAttribute('data-panel-id') as PanelId;
		target.classList.remove('drag-over');
		
		if (targetPanelId === 'map' || targetPanelId === draggedPanelId) {
			resetDragState();
			return;
		}

		// Get current order and calculate new position
		const currentOrder = $settings.order;
		const fromIndex = currentOrder.indexOf(draggedPanelId);
		const toIndex = currentOrder.indexOf(targetPanelId);

		if (fromIndex !== -1 && toIndex !== -1) {
			const newOrder = [...currentOrder];
			newOrder.splice(fromIndex, 1);
			newOrder.splice(toIndex, 0, draggedPanelId);
			settings.updateOrder(newOrder);
		}

		resetDragState();
	}

	// Handle drag end
	function handleDragEnd() {
		// Remove dragging and drag-over classes from all panels
		document.querySelectorAll('.dragging, .drag-over').forEach(el => {
			el.classList.remove('dragging', 'drag-over');
		});
		resetDragState();
	}

	// Reset drag state
	function resetDragState() {
		draggedPanelId = null;
		dragOverPanelId = null;
		isDragging = false;
	}
</script>

<main class="dashboard">
	<div 
		class="dashboard-grid" 
		class:is-dragging={isDragging}
		ondragstart={handleDragStart}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		ondragend={handleDragEnd}
	>
		{@render children()}
	</div>
</main>

<style>
	.dashboard {
		flex: 1;
		padding: 0.5rem;
		overflow-y: auto;
	}

	.dashboard-grid {
		column-count: 1;
		column-gap: 0.5rem;
		max-width: 2000px;
		margin: 0 auto;
	}

	.dashboard-grid > :global(*) {
		break-inside: avoid;
		margin-bottom: 0.5rem;
	}

	/* Drag and drop styles */
	.dashboard-grid > :global(.panel-slot) {
		transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
		position: relative;
	}

	.dashboard-grid > :global(.panel-slot[draggable="true"]) {
		cursor: grab;
	}

	.dashboard-grid > :global(.panel-slot[draggable="true"]:hover) {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.dashboard-grid > :global(.panel-slot[draggable="true"]:active) {
		cursor: grabbing;
	}

	.dashboard-grid > :global(.panel-slot.dragging) {
		opacity: 0.4;
		transform: scale(0.95);
		box-shadow: none;
	}

	.dashboard-grid > :global(.panel-slot.drag-over) {
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(var(--accent-rgb, 0, 136, 255), 0.3);
	}

	.dashboard-grid > :global(.panel-slot.drag-over::before) {
		content: '';
		position: absolute;
		inset: -2px;
		border: 2px dashed var(--accent);
		border-radius: 6px;
		pointer-events: none;
		z-index: 10;
	}

	.dashboard-grid.is-dragging > :global(.panel-slot:not(.dragging):not(.drag-over)) {
		opacity: 0.8;
	}

	/* Map slot is not draggable */
	.dashboard-grid > :global(.map-slot) {
		cursor: default;
	}

	.dashboard-grid > :global(.map-slot:hover) {
		box-shadow: none;
	}

	@media (min-width: 600px) {
		.dashboard-grid {
			column-count: 2;
		}
	}

	@media (min-width: 900px) {
		.dashboard-grid {
			column-count: 3;
		}
	}

	@media (min-width: 1200px) {
		.dashboard-grid {
			column-count: 4;
		}
	}

	@media (min-width: 1600px) {
		.dashboard-grid {
			column-count: 5;
		}
	}

	@media (min-width: 2000px) {
		.dashboard-grid {
			column-count: 6;
		}
	}
</style>
