<script lang="ts">
	import { PRESETS, PRESET_ORDER } from '$lib/config';
	import { t } from '$lib/stores';

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
	
	import type { TranslationKey } from '$lib/i18n/translations';
	
	function getPresetTranslationKey(presetId: string, suffix: string): TranslationKey {
		const keyMap: Record<string, string> = {
			'news-junkie': 'presets.newsJunkie',
			'trader': 'presets.trader',
			'geopolitics': 'presets.geopolitics',
			'intel': 'presets.intel',
			'minimal': 'presets.minimal',
			'everything': 'presets.everything'
		};
		return `${keyMap[presetId]}.${suffix}` as TranslationKey;
	}
</script>

{#if open}
	<div class="modal-overlay">
		<div class="modal onboarding-modal">
			<div class="modal-header">
				<button class="close-btn" onclick={handleClose} aria-label={$t('onboarding.skip')}>
					&times;
				</button>
				<h2>{$t('onboarding.welcome')}</h2>
				<p class="subtitle">{$t('onboarding.subtitle')}</p>
			</div>

			<div class="preset-grid">
				{#each PRESET_ORDER as presetId}
					{@const preset = PRESETS[presetId]}
					<button class="preset-card" onclick={() => handleSelectPreset(presetId)}>
						<div class="preset-icon">{preset.icon}</div>
						<div class="preset-name">{$t(getPresetTranslationKey(presetId, 'name'))}</div>
						<div class="preset-description">{$t(getPresetTranslationKey(presetId, 'description'))}</div>
						<div class="preset-panel-count">{$t('presets.panels', { count: preset.panels.length })}</div>
					</button>
				{/each}
			</div>

			<div class="modal-footer">
				<p class="hint">{$t('onboarding.hint')}</p>
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
		border: 1px solid var(--border);
		border-radius: 8px;
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		position: relative;
		padding: 1.5rem;
		text-align: center;
		border-bottom: 1px solid var(--border);
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
		border-radius: 4px;
		color: var(--text-secondary);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: var(--bg);
		color: var(--text-primary);
		border-color: var(--text-secondary);
	}

	.modal-header h2 {
		color: var(--text-primary);
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 0.8rem;
		margin: 0;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		padding: 1.5rem;
	}

	.preset-card {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 1.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preset-card:hover {
		border-color: var(--accent);
		background: rgba(0, 255, 136, 0.05);
	}

	.preset-icon {
		font-size: 2rem;
		margin-bottom: 0.25rem;
	}

	.preset-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.preset-description {
		font-size: 0.7rem;
		color: var(--text-secondary);
		line-height: 1.4;
		flex: 1;
	}

	.preset-panel-count {
		font-size: 0.65rem;
		color: var(--accent);
		font-weight: 500;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--border);
		text-align: center;
	}

	.hint {
		color: var(--text-muted);
		font-size: 0.7rem;
		margin: 0;
	}

	@media (max-width: 768px) {
		.preset-grid {
			grid-template-columns: 1fr;
		}

		.modal-header h2 {
			font-size: 1.1rem;
		}
	}
</style>
