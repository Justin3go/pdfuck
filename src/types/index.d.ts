import type { ReactNode } from 'react';

/**
 * website config, without translations
 */
export type WebsiteConfig = {
  ui: UiConfig;
  metadata: MetadataConfig;
  analytics: AnalyticsConfig;
  i18n: I18nConfig;
  blog: BlogConfig;
  docs: DocsConfig;
};

/**
 * UI configuration
 */
export interface UiConfig {
  mode?: ModeConfig;
}

/**
 * Website metadata
 */
export interface MetadataConfig {
  images?: ImagesConfig;
  social?: SocialConfig;
  contactEmail?: string;
}

export interface ModeConfig {
  defaultMode?: 'light' | 'dark' | 'system';                  // The default mode of the website
  enableSwitch?: boolean;                                     // Whether to enable the mode switch
}

export interface ImagesConfig {
  ogImage?: string;                                           // The image as Open Graph image
  logoLight?: string;                                         // The light logo image
  logoDark?: string;                                          // The dark logo image
}

/**
 * Social media configuration
 */
export interface SocialConfig {
  twitter?: string;
  github?: string;
  discord?: string;
  blueSky?: string;
  mastodon?: string;
  youtube?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enableVercelAnalytics?: boolean;    // Whether to enable vercel analytics
  enableSpeedInsights?: boolean;      // Whether to enable speed insights
}

/**
 * I18n configuration
 *
 * hreflang: Hreflang value for SEO (e.g., 'en', 'zh-CN')
 * https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
 * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 */
export interface I18nConfig {
  defaultLocale: string;              // The default locale of the website
  locales: Record<string, {
    flag?: string;                    // The flag of the locale, leave empty if you don't want to display the flag
    name: string;                     // The name of the locale
    hreflang?: string;                // Hreflang value for SEO (e.g., 'en', 'zh-CN')
  }>;
}

/**
 * Blog configuration
 */
export interface BlogConfig {
  enable: boolean;                   // Whether to enable the blog
  paginationSize: number;            // Number of posts per page
  relatedPostsSize: number;          // Number of related posts to show
}

/**
 * Docs configuration
 */
export interface DocsConfig {
  enable: boolean;                   // Whether to enable the docs
}

/**
 * menu item, used for navbar links, sidebar links, footer links
 */
export type MenuItem = {
  title: string;                      // The text to display
  description?: string;               // The description of the item
  icon?: ReactNode;                   // The icon to display
  href?: string;                      // The url to link to
  external?: boolean;                 // Whether the link is external
};

/**
 * nested menu item, used for navbar links, sidebar links, footer links
 */
export type NestedMenuItem = MenuItem & {
  items?: MenuItem[];                // The items to display in the nested menu
};

/**
 * Blog Category
 *
 * we can not pass CategoryType from server component to client component
 * so we need to define a new type, and use it in the client component
 */
export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
};
