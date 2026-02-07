import { docsI18nConfig } from '@/lib/docs/i18n';
import { blogSource } from '@/lib/source';
import { createTokenizer } from '@orama/tokenizers/mandarin';
import { createI18nSearchAPI } from 'fumadocs-core/search/server';

/**
 * Blog i18n search configuration
 *
 * 1. For internationalization, use createI18nSearchAPI:
 * https://fumadocs.dev/docs/headless/search/orama#internationalization
 *
 * 2. For special languages like Chinese, configure custom tokenizers:
 * https://fumadocs.dev/docs/headless/search/orama#special-languages
 * https://docs.orama.com/docs/orama-js/supported-languages/using-chinese-with-orama
 */
const searchAPI = createI18nSearchAPI('advanced', {
  // Pass the i18n config for proper language detection
  i18n: docsI18nConfig,

  // Get all blog pages from all languages and map them to search indexes
  indexes: blogSource.getLanguages().flatMap(({ language, pages }) =>
    pages
      .filter((page) => page.data.published)
      .map((page) => ({
        title: page.data.title,
        description: page.data.description,
        structuredData: page.data.structuredData,
        id: page.url,
        url: page.url,
        locale: language,
      }))
  ),

  // Configure special language tokenizers and search options
  localeMap: {
    // Chinese configuration with Mandarin tokenizer
    zh: {
      components: {
        tokenizer: createTokenizer(),
      },
      search: {
        // Lower threshold for better matches with Chinese text
        threshold: 0,
        // Lower tolerance for better precision
        tolerance: 0,
      },
    },

    // Use the default English tokenizer for English content
    en: 'english',

    // Languages supported by Orama
    es: 'spanish',
    fr: 'french',
    de: 'german',
    pt: 'portuguese',
    ru: 'russian',
    it: 'italian',

    // Japanese and Korean are not supported by Orama, fallback to english
    ja: 'english',
    ko: 'english',
  },

  // Global search configuration
  search: {
    limit: 20,
  },
});

export const GET = async (request: Request) => {
  const response = await searchAPI.GET(request);
  return response;
};
