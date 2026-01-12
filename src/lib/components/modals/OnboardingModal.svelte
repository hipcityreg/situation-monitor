<script lang="ts">
	import { PRESETS, PRESET_ORDER } from '$lib/config';

	interface Props {
		open: boolean;
		onSelectPreset: (presetId: string) => void;
		onSkip?: () => void;
	}

	let { open, onSelectPreset, onSkip }: Props = $props();

	function handleSelectPreset(presetId: string) {
		onSelectPreset(presetId);
	}

	function handleSkip() {
		// Select the 'everything' preset (show all panels) when skipping
		onSelectPreset('everything');
	}

	function handleClose() {
		if (onSkip) {
			onSkip();
		} else {
			handleSkip();
		}
	}
</script>

{#if open}
	<div class="modal-overlay">
		<div class="modal onboarding-modal">
			<!-- Tech Corner Decorations -->
			<div class="tech-corner top-left"></div>
			<div class="tech-corner top-right"></div>
			<div class="tech-corner bottom-left"></div>
			<div class="tech-corner bottom-right"></div>

			<div class="modal-header">
				<button class="close-btn" onclick={handleClose} aria-label="Skip onboarding">
					&times;
				</button>
				<h2>SITUATION MONITOR</h2>
				<p class="subtitle">Choose a dashboard configuration to get started</p>
			</div>

			<div class="preset-grid">
				{#each PRESET_ORDER as presetId}
					{@const preset = PRESETS[presetId]}
					<button class="preset-card" onclick={() => handleSelectPreset(presetId)}>
						<div class="preset-icon">{preset.icon}</div>
						<div class="preset-name">{preset.name}</div>
						<div class="preset-description">{preset.description}</div>
						<div class="preset-panel-count">{preset.panels.length} PANELS</div>
					</button>
				{/each}
			</div>

			<div class="modal-footer">
				<p class="hint">You can change this later in Settings</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		padding: 1rem;
	}

	.onboarding-modal {
		background: var(--surface);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--border);
		border-radius: 2px;
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		isolation: isolate;
	}

	/* Tech Corner Decorations */
	.tech-corner {
		position: absolute;
		width: 12px;
		height: 12px;
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
		position: relative;
		padding: 1.5rem;
		text-align: center;
		border-bottom: 1px solid var(--border-divider);
		background: var(--surface-solid);
	}

	.close-btn {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 2px;
		color: var(--text-dim);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.close-btn:hover {
		background: var(--surface-hover);
		color: var(--accent);
		border-color: var(--accent);
	}

	.modal-header h2 {
		color: var(--text-primary);
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		margin: 0 0 0.5rem;
	}

	.subtitle {
		color: var(--text-dim);
		font-size: 0.7rem;
		margin: 0;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		padding: 1.5rem;
	}

	.preset-card {
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: 2px;
		padding: 1.25rem;
		cursor: pointer;
		transition: all 0.15s ease;
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;
	}

	.preset-card:hover {
		border-color: var(--accent);
		background: rgba(34, 211, 238, 0.05);
	}

	.preset-icon {
		font-size: 1.75rem;
		margin-bottom: 0.25rem;
	}

	.preset-name {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.preset-description {
		font-size: 0.65rem;
		color: var(--text-dim);
		line-height: 1.4;
		flex: 1;
	}

	.preset-panel-count {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--accent);
		font-weight: 700;
		letter-spacing: 0.1em;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--border-divider);
		text-align: center;
		background: var(--surface-solid);
	}

	.hint {
		color: var(--text-muted);
		font-size: 0.625rem;
		font-family: 'SF Mono', Monaco, monospace;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	@media (max-width: 768px) {
		.preset-grid {
			grid-template-columns: 1fr;
		}

		.modal-header h2 {
			font-size: 0.75rem;
		}
	}
</style>
