<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { isLoading } from 'svelte-i18n';
	import { initI18n } from '$lib/i18n';
	import { settings } from '$lib/stores/settings';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Initialize i18n with saved locale
	onMount(() => {
		const savedLocale = settings.getLocale();
		initI18n(savedLocale);
	});
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
