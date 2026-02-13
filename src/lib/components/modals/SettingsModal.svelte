<script lang="ts">
	import Modal from './Modal.svelte';
	import { settings, t } from '$lib/stores';
	import { PANELS, type PanelId } from '$lib/config';
	import { LanguageSwitcher } from '$lib/components/common';

	interface Props {
		open: boolean;
		onClose: () => void;
		onReconfigure?: () => void;
	}

	let { open = false, onClose, onReconfigure }: Props = $props();

	function handleTogglePanel(panelId: PanelId) {
		settings.togglePanel(panelId);
	}

	function handleResetPanels() {
		settings.reset();
	}
</script>

<Modal {open} title={$t('settings.title')} {onClose}>
	<div class="settings-sections">
		<section class="settings-section">
			<h3 class="section-title">{$t('settings.panels.title')}</h3>
			<p class="section-desc">{$t('settings.panels.description')}</p>

			<div class="panels-grid">
				{#each Object.entries(PANELS) as [id, config]}
					{@const panelId = id as PanelId}
					{@const isEnabled = $settings.enabled[panelId]}
					{@const panelNameKey = `panels.${panelId}.name` as import('$lib/i18n/translations').TranslationKey}
					<label class="panel-toggle" class:enabled={isEnabled}>
						<input
							type="checkbox"
							checked={isEnabled}
							onchange={() => handleTogglePanel(panelId)}
						/>
						<span class="panel-name">{$t(panelNameKey)}</span>
						<span class="panel-priority">P{config.priority}</span>
					</label>
				{/each}
			</div>
		</section>

		<section class="settings-section">
			<h3 class="section-title">{$t('settings.language.title')}</h3>
			<p class="section-desc">{$t('settings.language.description')}</p>
			<div class="language-section">
				<LanguageSwitcher variant="button" />
			</div>
		</section>

		<section class="settings-section">
			<h3 class="section-title">{$t('settings.dashboard.title')}</h3>
			{#if onReconfigure}
				<button class="reconfigure-btn" onclick={onReconfigure}>{$t('settings.dashboard.reconfigure')}</button>
				<p class="btn-hint">{$t('settings.dashboard.reconfigureHint')}</p>
			{/if}
			<button class="reset-btn" onclick={handleResetPanels}>{$t('settings.dashboard.reset')}</button>
		</section>
	</div>
</Modal>

<style>
	.settings-sections {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.settings-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		margin: 0;
	}

	.section-desc {
		font-size: 0.65rem;
		color: var(--text-muted);
		margin: 0;
	}
	
	.language-section {
		margin-top: 0.5rem;
	}

	.panels-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.panel-toggle {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.panel-toggle:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.panel-toggle.enabled {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
	}

	.panel-toggle input {
		accent-color: var(--accent);
	}

	.panel-name {
		flex: 1;
		font-size: 0.65rem;
		color: var(--text-primary);
	}

	.panel-priority {
		font-size: 0.5rem;
		color: var(--text-muted);
		background: rgba(255, 255, 255, 0.05);
		padding: 0.1rem 0.25rem;
		border-radius: 2px;
	}

	.reconfigure-btn {
		padding: 0.5rem 1rem;
		background: rgba(0, 255, 136, 0.1);
		border: 1px solid rgba(0, 255, 136, 0.3);
		border-radius: 4px;
		color: var(--accent);
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.15s ease;
		margin-bottom: 0.25rem;
	}

	.reconfigure-btn:hover {
		background: rgba(0, 255, 136, 0.2);
	}

	.btn-hint {
		font-size: 0.6rem;
		color: var(--text-muted);
		margin: 0 0 0.75rem;
	}

	.reset-btn {
		padding: 0.5rem 1rem;
		background: rgba(255, 68, 68, 0.1);
		border: 1px solid rgba(255, 68, 68, 0.3);
		border-radius: 4px;
		color: var(--danger);
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.reset-btn:hover {
		background: rgba(255, 68, 68, 0.2);
	}
</style>
