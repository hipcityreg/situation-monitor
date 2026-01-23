import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('zh', () => import('./locales/zh.json'));

export const SUPPORTED_LOCALES = ['en', 'zh'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function initI18n(initialLocale?: string) {
	init({
		fallbackLocale: 'en',
		initialLocale: initialLocale || getLocaleFromNavigator() || 'en'
	});
}
