<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// Drag-drop state and handlers will be added in Phase 4
	// when panels are fully implemented
</script>

<main class="dashboard">
	<div class="dashboard-grid">
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
		column-fill: balance;
		max-width: 2000px;
		margin: 0 auto;
	}

	.dashboard-grid > :global(*) {
		break-inside: avoid;
		margin-bottom: 0.5rem;
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
