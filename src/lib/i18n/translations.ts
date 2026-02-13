/**
 * Translation Key Type Definitions
 * 
 * This file centralizes all translation keys used throughout the application.
 * It imports the English translation file to derive TypeScript types,
 * ensuring compile-time safety for all translation lookups.
 * 
 * When adding new translations:
 * 1. Add the key-value pair to locales/en.json
 * 2. Add the corresponding translation to locales/zh.json
 * 3. The TypeScript type will be automatically updated
 */

import type en from './locales/en.json';

/**
 * All valid translation keys derived from the English translation file
 * This ensures type safety - using an invalid key will cause a TypeScript error
 */
export type TranslationKey = keyof typeof en;

/**
 * Translation dictionary structure for all supported locales
 */
export type Translations = {
	en: Record<TranslationKey, string>;
	zh: Record<TranslationKey, string>;
};

// Import actual translation data
import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';

/**
 * Complete translations object containing all locales
 * Used by the i18n store to resolve translation keys
 */
export const translations: Translations = {
	en: enTranslations,
	zh: zhTranslations
};
