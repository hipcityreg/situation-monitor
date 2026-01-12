/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Aegis Design System Colors
				// Background Colors
				'bg-app': '#050505',
				'bg-globe': '#020305',

				// Legacy mappings for backward compatibility
				bg: '#050505',
				surface: 'rgb(2 6 23 / 0.8)', // slate-950/80
				'surface-hover': 'rgb(30 41 59 / 0.5)', // slate-800/50
				border: 'rgb(51 65 85 / 0.5)', // slate-700/50
				'border-light': 'rgb(71 85 105)', // slate-600
				'text-primary': '#ffffff',
				'text-secondary': 'rgb(226 232 240)', // slate-200
				'text-dim': 'rgb(148 163 184)', // slate-400
				'text-muted': 'rgb(100 116 139)', // slate-500

				// Primary Accent (Cyan)
				accent: 'rgb(34 211 238)', // cyan-400
				'accent-solid': 'rgb(8 145 178)', // cyan-600
				'accent-hover': 'rgb(6 182 212)', // cyan-500
				'accent-glow': '#06b6d4',

				// Semantic Colors
				// Critical (Red)
				danger: 'rgb(239 68 68)', // red-500
				'critical-bg': 'rgb(69 10 10 / 0.5)', // red-950/50
				'critical-border': 'rgb(127 29 29 / 0.5)', // red-800/50

				// Warning (Amber)
				warning: 'rgb(245 158 11)', // amber-500
				'warning-bg': 'rgb(69 26 3 / 0.5)', // amber-950/50
				'warning-border': 'rgb(146 64 14 / 0.5)', // amber-800/50

				// Success (Emerald)
				success: 'rgb(16 185 129)', // emerald-500
				'success-bg': 'rgb(2 44 34 / 0.5)', // emerald-950/50
				'success-border': 'rgb(6 95 70 / 0.5)', // emerald-800/50

				// Info (Cyan alias)
				info: 'rgb(34 211 238)' // cyan-400
			},
			fontFamily: {
				sans: ['Geist Sans', 'SF Pro Display', 'system-ui', 'sans-serif'],
				mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace']
			},
			fontSize: {
				'2xs': '0.65rem',
				micro: '0.625rem', // 10px
				nano: '0.5625rem' // 9px
			},
			borderRadius: {
				sm: '2px',
				DEFAULT: '4px'
			},
			boxShadow: {
				'glow-cyan': '0 0 10px rgb(6 182 212)',
				'glow-amber': '0 0 15px rgba(245, 158, 11, 0.5)',
				'glow-red': '0 0 10px rgba(239, 68, 68, 0.5)'
			},
			animation: {
				shimmer: 'shimmer 1.5s infinite',
				pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			keyframes: {
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			}
		}
	},
	plugins: []
};
