<script lang="ts">
	import type { NewsItem } from '$lib/types';
	import { timeAgo } from '$lib/utils';

	interface Props {
		item: NewsItem;
		showSource?: boolean;
		showAlert?: boolean;
		showDescription?: boolean;
		compact?: boolean;
	}

	let {
		item,
		showSource = true,
		showAlert = true,
		showDescription = false,
		compact = false
	}: Props = $props();

	const isAlertItem = $derived(showAlert && item.isAlert);
</script>

<div
	class="cursor-pointer transition-colors hover:bg-white/5 {compact ? 'py-1.5' : 'py-2'} {isAlertItem
		? 'bg-red-950/50 border-l-2 border-red-500 -mx-2 px-2 rounded-sm'
		: 'border-b border-slate-800 last:border-b-0'}"
>
	{#if showSource}
		<div class="text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1.5">
			{item.source}
			{#if isAlertItem}
				<span class="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide">
					ALERT
				</span>
			{/if}
		</div>
	{/if}

	<a
		class="block text-xs font-bold leading-snug text-slate-200 no-underline transition-colors hover:text-cyan-400 {compact
			? 'text-[11px]'
			: ''}"
		href={item.link}
		target="_blank"
		rel="noopener noreferrer"
	>
		{item.title}
	</a>

	{#if showDescription && item.description}
		<p class="text-[10px] text-slate-400 mt-1.5 leading-relaxed border-l-2 border-slate-700 pl-2">
			{item.description}
		</p>
	{/if}

	<div class="flex items-center gap-2 mt-1">
		<span class="text-[10px] font-mono text-slate-500">{timeAgo(item.timestamp)}</span>
		{#if item.region}
			<span
				class="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded-sm border border-cyan-400/30 uppercase tracking-wide"
			>
				{item.region}
			</span>
		{/if}
	</div>
</div>
