<!--
  LanguageSwitcher Component
  
  A reusable language selector that supports three visual variants:
  - 'button': Segmented button with flags and labels (default)
  - 'select': Native dropdown select element
  - 'minimal': Single toggle button showing current language
  
  Features:
  - Integrates with the global locale store
  - Visual feedback for active language
  - Accessible with proper ARIA labels
  - Responsive design
  
  Usage:
    <LanguageSwitcher variant="button" />
    <LanguageSwitcher variant="select" />
    <LanguageSwitcher variant="minimal" />
-->
<script lang="ts">
	import { locale } from '$lib/i18n';
	
	interface Props {
		/** Visual style variant */
		variant?: 'button' | 'select' | 'minimal';
	}
	
	let { variant = 'button' }: Props = $props();
	
	/** Language configuration with display labels and flags */
	const languages = [
		{ code: 'en' as const, label: 'EN', flag: '🇺🇸' },
		{ code: 'zh' as const, label: '中', flag: '🇨🇳' }
	];
	
	/**
	 * Handle language selection
	 * @param code - The locale code to switch to
	 */
	function handleChange(code: 'en' | 'zh') {
		locale.setLocale(code);
	}
</script>

{#if variant === 'button'}
	<!-- Segmented button variant - shows both languages as toggle buttons -->
	<div class="language-switcher">
		{#each languages as lang}
			<button
				class="lang-btn"
				class:active={$locale === lang.code}
				onclick={() => handleChange(lang.code)}
				title={lang.code === 'en' ? 'English' : '中文'}
			>
				<span class="flag">{lang.flag}</span>
				<span class="label">{lang.label}</span>
			</button>
		{/each}
	</div>
{:else if variant === 'select'}
	<!-- Select dropdown variant - native select element -->
	<select 
		class="language-select"
		value={$locale}
		onchange={(e) => handleChange(e.currentTarget.value as 'en' | 'zh')}
	>
		{#each languages as lang}
			<option value={lang.code}>
				{lang.flag} {lang.code === 'en' ? 'English' : '中文'}
			</option>
		{/each}
	</select>
{:else}
	<!-- Minimal variant - single button showing current language -->
	<button
		class="lang-toggle"
		onclick={() => locale.toggle()}
		title={$locale === 'en' ? 'Switch to 中文' : 'Switch to English'}
	>
		<span class="current">{$locale === 'en' ? '🇺🇸 EN' : '🇨🇳 中'}</span>
	</button>
{/if}

<style>
	/* === Button Variant Styles === */
	.language-switcher {
		display: flex;
		gap: 0.25rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.15rem;
	}
	
	.lang-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: none;
		border-radius: 3px;
		color: var(--text-muted);
		font-size: 0.6rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	
	.lang-btn:hover {
		color: var(--text-secondary);
		background: rgba(255, 255, 255, 0.05);
	}
	
	.lang-btn.active {
		background: rgba(0, 255, 136, 0.1);
		color: var(--accent);
	}
	
	.flag {
		font-size: 0.7rem;
	}
	
	.label {
		font-weight: 500;
		font-family: var(--font-mono);
	}
	
	/* === Select Variant Styles === */
	.language-select {
		padding: 0.4rem 0.6rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-primary);
		font-size: 0.7rem;
		cursor: pointer;
		font-family: var(--font-mono);
	}
	
	.language-select:focus {
		outline: none;
		border-color: var(--accent);
	}
	
	/* === Minimal Variant Styles === */
	.lang-toggle {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-secondary);
		font-size: 0.65rem;
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: var(--font-mono);
	}
	
	.lang-toggle:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--border-light);
	}
	
	.current {
		font-weight: 500;
	}
</style>
