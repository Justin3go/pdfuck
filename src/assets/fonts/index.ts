import { Geist_Mono } from 'next/font/google';

/**
 * Fonts Configuration
 *
 * 只使用 Geist Mono 作为主字体，减少字体文件加载以优化 LCP。
 *
 * 如需添加其他字体，可参考：
 * - Google Fonts: https://fonts.google.com
 * - Next.js Font Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 */

// https://fonts.google.com/specimen/Geist+Mono
// 只预加载最常用的 weights (400 用于正文，600 用于标题)
export const fontGeistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
  weight: ['400', '600'],
});
