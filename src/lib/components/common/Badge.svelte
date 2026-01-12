<script lang="ts">
	interface Props {
		text: string;
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'critical' | 'neutral';
		size?: 'sm' | 'md';
	}

	let { text, variant = 'default', size = 'sm' }: Props = $props();

	const sizeClasses: Record<string, string> = {
		sm: 'text-[10px] px-1.5 py-0.5',
		md: 'text-[11px] px-2 py-1'
	};

	const variantClasses: Record<string, string> = {
		critical: 'bg-red-950/50 text-red-500 border-red-800/50',
		danger: 'bg-red-950/50 text-red-500 border-red-800/50',
		warning: 'bg-amber-950/50 text-amber-500 border-amber-800/50',
		success: 'bg-emerald-950/50 text-emerald-500 border-emerald-800/50',
		neutral: 'bg-slate-800/50 text-slate-400 border-slate-700/50',
		default: 'bg-slate-800/50 text-slate-400 border-slate-700/50',
		info: 'bg-cyan-950/50 text-cyan-400 border-cyan-800/50'
	};

	const classes = $derived(variantClasses[variant] || variantClasses.default);
</script>

<span
	class="inline-flex items-center font-mono uppercase tracking-wider rounded-sm border {sizeClasses[size]} {classes}"
>
	{text}
</span>
