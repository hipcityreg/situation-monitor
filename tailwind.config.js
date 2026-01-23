/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Use CSS variables so they swap instantly
				bg: 'var(--bg)',
				surface: 'var(--surface)',
				'surface-hover': 'var(--surface-hover)',
				border: 'var(--border)',
				'border-light': 'var(--border-light)',
				'text-primary': 'var(--text)',
				'text-dim': 'var(--text-dim)',
				'text-muted': 'var(--text-muted)',
				accent: 'var(--accent)', // This stays white/black depending on theme
				danger: '#ff4444',
				success: '#00cc66', // Slightly darker green for visibility on white
				warning: '#ffaa00',
				info: '#4488ff'
			},
			fontFamily: {
				mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace']
			},
			fontSize: {
				'2xs': '0.65rem'
			},
			animation: {
				shimmer: 'shimmer 1.5s infinite'
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
