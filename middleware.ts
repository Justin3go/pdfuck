import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

// https://next-intl.dev/docs/routing/middleware
export default createMiddleware(routing);

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
