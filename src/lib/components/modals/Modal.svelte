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
		/* Aegis backdrop: bg-black/80 backdrop-blur-sm */
		background: rgb(0 0 0 / 0.8);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		/* Aegis glass morphism: bg-slate-950/80 backdrop-blur-md */
		background: rgb(2 6 23 / 0.8);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		/* Aegis border: border border-slate-700/50 */
		border: 1px solid rgb(51 65 85 / 0.5);
		border-radius: 2px;
		width: 100%;
		max-width: 500px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		isolation: isolate;
		/* Aegis shadow: shadow-2xl */
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
	}

	/* Tech Corner Decorations - 8px x 8px with cyan-500/50 border */
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
		border-top: 2px solid rgb(6 182 212 / 0.5);
		border-left: 2px solid rgb(6 182 212 / 0.5);
	}

	.tech-corner.top-right {
		top: 0;
		right: 0;
		border-top: 2px solid rgb(6 182 212 / 0.5);
		border-right: 2px solid rgb(6 182 212 / 0.5);
	}

	.tech-corner.bottom-left {
		bottom: 0;
		left: 0;
		border-bottom: 2px solid rgb(6 182 212 / 0.5);
		border-left: 2px solid rgb(6 182 212 / 0.5);
	}

	.tech-corner.bottom-right {
		bottom: 0;
		right: 0;
		border-bottom: 2px solid rgb(6 182 212 / 0.5);
		border-right: 2px solid rgb(6 182 212 / 0.5);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		/* Aegis header: p-4 (16px), bg-slate-900, border-b border-slate-800 */
		padding: 1rem;
		background: rgb(15 23 42);
		border-bottom: 1px solid rgb(30 41 59);
	}

	.modal-title {
		/* Aegis typography: text-lg (18px), font-bold, text-white */
		font-size: 1.125rem;
		line-height: 1.75rem;
		font-weight: 700;
		margin: 0;
		color: rgb(255 255 255);
	}

	.modal-close {
		background: none;
		border: 1px solid rgb(51 65 85 / 0.5);
		color: rgb(148 163 184);
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
		background: rgb(30 41 59);
		border-color: rgb(6 182 212);
		/* Aegis close button hover: text-cyan-400 */
		color: rgb(34 211 238);
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.modal-footer {
		padding: 1rem;
		border-top: 1px solid rgb(30 41 59);
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		background: rgb(15 23 42);
	}
</style>
