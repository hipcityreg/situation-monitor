<script lang="ts">
	import type { Snippet } from 'svelte';
	import { panelLayout, isDragging, currentDropTarget, type PanelZone } from '$lib/stores';
	import type { PanelId } from '$lib/config';

	interface Props {
		zone: PanelZone;
		panels: PanelId[];
		class?: string;
		children: Snippet;
	}

	let { zone, panels, class: className = '', children }: Props = $props();

	// Track if this zone is the current drop target
	let isOver = $state(false);
	let dropIndex = $state(0);

	const isTargeted = $derived(
		$currentDropTarget?.zone === zone && $isDragging
	);

	function handleDragOver(event: DragEvent) {
		if (!$isDragging) return;

		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		isOver = true;

		// Calculate drop index based on mouse position
		const container = event.currentTarget as HTMLElement;
		const rect = container.getBoundingClientRect();

		if (zone === 'bottom') {
			// Horizontal layout for bottom zone
			const relativeX = event.clientX - rect.left;
			const itemWidth = rect.width / Math.max(panels.length, 1);
			dropIndex = Math.min(Math.floor(relativeX / itemWidth), panels.length);
		} else {
			// Vertical layout for left/right zones
			const relativeY = event.clientY - rect.top;
			const itemHeight = rect.height / Math.max(panels.length, 1);
			dropIndex = Math.min(Math.floor(relativeY / itemHeight), panels.length);
		}

		panelLayout.setDropTarget(zone, dropIndex);
	}

	function handleDragLeave(event: DragEvent) {
		// Only handle if leaving the container (not a child)
		const relatedTarget = event.relatedTarget as Node | null;
		const currentTarget = event.currentTarget as HTMLElement;

		if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
			isOver = false;
			panelLayout.clearDropTarget();
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isOver = false;

		// The endDrag will handle the actual move
		panelLayout.endDrag();
	}
</script>

<div
	class="drop-zone {className}"
	class:is-over={isOver && $isDragging}
	class:is-targeted={isTargeted}
	class:is-dragging={$isDragging}
	data-zone={zone}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="list"
	aria-label="{zone} panel zone"
>
	{@render children()}

	<!-- Drop indicator -->
	{#if isOver && $isDragging}
		<div class="drop-indicator" class:horizontal={zone === 'bottom'}>
			<div class="drop-indicator-line"></div>
			<div class="drop-indicator-text">DROP HERE</div>
		</div>
	{/if}
</div>

<style>
	.drop-zone {
		position: relative;
		min-height: 100px;
		transition: all 0.2s ease;
	}

	.drop-zone.is-dragging {
		/* Subtle highlight when any drag is in progress */
		opacity: 1;
	}

	.drop-zone.is-over {
		background: rgba(34, 211, 238, 0.05);
		border-radius: 4px;
	}

	.drop-zone.is-targeted {
		outline: 2px dashed rgba(34, 211, 238, 0.5);
		outline-offset: 4px;
	}

	.drop-indicator {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		pointer-events: none;
		z-index: 100;
	}

	.drop-indicator:not(.horizontal) {
		top: 0;
	}

	.drop-indicator.horizontal {
		top: 50%;
		transform: translateY(-50%);
		flex-direction: row;
		left: 50%;
		right: auto;
		transform: translate(-50%, -50%);
	}

	.drop-indicator-line {
		width: 100%;
		height: 2px;
		background: linear-gradient(to right, transparent, rgb(34 211 238), transparent);
		border-radius: 1px;
	}

	.drop-indicator.horizontal .drop-indicator-line {
		width: 2px;
		height: 40px;
		background: linear-gradient(to bottom, transparent, rgb(34 211 238), transparent);
	}

	.drop-indicator-text {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: rgb(34 211 238);
		background: rgb(15 23 42 / 0.9);
		padding: 0.125rem 0.5rem;
		border-radius: 2px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		white-space: nowrap;
	}
</style>
