<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		onClose: () => void;
		header?: Snippet;
		footer?: Snippet;
		children: Snippet;
	}

	let { open = false, title, onClose, header, footer, children }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={handleBackdropClick}>
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<!-- Tech Corner Decorations -->
			<div class="tech-corner top-left"></div>
			<div class="tech-corner top-right"></div>
			<div class="tech-corner bottom-left"></div>
			<div class="tech-corner bottom-right"></div>

			<div class="modal-header">
				<h2 id="modal-title" class="modal-title">{title}</h2>
				{#if header}
					{@render header()}
				{/if}
				<button class="modal-close" onclick={onClose} aria-label="Close">×</button>
			</div>

			<div class="modal-content">
				{@render children()}
			</div>

			{#if footer}
				<div class="modal-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		/* Glass morphism effect */
		background: var(--surface);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--border);
		border-radius: 2px;
		width: 100%;
		max-width: 500px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		isolation: isolate;
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
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

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: var(--surface-solid);
		border-bottom: 1px solid var(--border-divider);
	}

	.modal-title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		margin: 0;
		color: var(--text-primary);
	}

	.modal-close {
		background: none;
		border: 1px solid var(--border);
		color: var(--text-dim);
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 2px;
		transition: all 0.15s;
	}

	.modal-close:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
		color: var(--accent);
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.modal-footer {
		padding: 1rem;
		border-top: 1px solid var(--border-divider);
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		background: var(--surface-solid);
	}
</style>
