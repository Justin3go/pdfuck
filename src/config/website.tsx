import type { WebsiteConfig } from '@/types';

/**
 * website config, without translations
 *
 * docs:
 * https://mksaas.com/docs/config/website
 */
export const websiteConfig: WebsiteConfig = {
  ui: {
    mode: {
      defaultMode: 'dark',
      enableSwitch: true,
    },
  },
  metadata: {
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    },
    social: {
      github: 'https://github.com/MkSaaSHQ',
      twitter: 'https://mksaas.link/twitter',
      blueSky: 'https://mksaas.link/bsky',
      discord: 'https://mksaas.link/discord',
      mastodon: 'https://mksaas.link/mastodon',
      linkedin: 'https://mksaas.link/linkedin',
      youtube: 'https://mksaas.link/youtube',
    },
    contactEmail: 'support@mksaas.com',
  },
  analytics: {
    enableVercelAnalytics: false,
    enableSpeedInsights: false,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: {
        flag: '🇺🇸',
        name: 'English',
        hreflang: 'en',
      },
      zh: {
        flag: '🇨🇳',
        name: '中文',
        hreflang: 'zh-CN',
      },
      es: {
        flag: '🇪🇸',
        name: 'Español',
        hreflang: 'es',
      },
      fr: {
        flag: '🇫🇷',
        name: 'Français',
        hreflang: 'fr',
      },
      de: {
        flag: '🇩🇪',
        name: 'Deutsch',
        hreflang: 'de',
      },
      ja: {
        flag: '🇯🇵',
        name: '日本語',
        hreflang: 'ja',
      },
      ko: {
        flag: '🇰🇷',
        name: '한국어',
        hreflang: 'ko',
      },
      pt: {
        flag: '🇵🇹',
        name: 'Português',
        hreflang: 'pt',
      },
      ru: {
        flag: '🇷🇺',
        name: 'Русский',
        hreflang: 'ru',
      },
      it: {
        flag: '🇮🇹',
        name: 'Italiano',
        hreflang: 'it',
      },
    },
  },
  blog: {
    enable: true,
    paginationSize: 6,
    relatedPostsSize: 3,
  },
  docs: {
    enable: false,
  },
};
