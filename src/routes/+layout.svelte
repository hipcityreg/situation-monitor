<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { isLoading } from 'svelte-i18n';
	import { initI18n } from '$lib/i18n';
	import { settings } from '$lib/stores/settings';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Initialize i18n immediately with saved locale (not in onMount)
	if (browser) {
		const savedLocale = settings.getLocale();
		initI18n(savedLocale);
	}
</script>

{#if $isLoading}
	<div class="min-h-screen bg-bg text-text-primary flex items-center justify-center">
		<div class="text-text-muted">Loading...</div>
	</div>
{:else}
	<div class="min-h-screen bg-bg text-text-primary">
		{@render children()}
	</div>
{/if}
