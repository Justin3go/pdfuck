# Repository Guidelines

## Project Structure & Module Organization

Routes and server actions live in `src/app` (locale-aware pages in `[locale]`). Reusable UI sits in `src/components`—libraries like `ui/`, `magicui/`, `tailark/`, plus domain folders. Shared logic and AI workflows belong in `src/lib` and `src/ai`, while Drizzle schemas and migrations stay in `src/db`. Place transactional emails in `src/mail`, analytics providers in `src/analytics`, static assets in `public/`, operational scripts in `scripts/`, and marketing/docs content in `content/`.

### Key Directory Structure
- `src/app/` - Next.js app router with internationalized routing
- `src/components/` - Reusable React components organized by feature
  - `src/components/pdf/` - PDF tools UI components
  - `src/components/pdf/tools/` - Individual PDF tool components
- `src/lib/` - Utility functions and shared code
  - `src/lib/pdf/` - PDF processing library functions
- `src/ai/` - AI workflows and integrations
- `src/db/` - Database schema and migrations
- `src/actions/` - Server actions for API operations
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom React hooks
- `src/config/` - Application configuration files
- `src/i18n/` - Internationalization setup
- `src/mail/` - Email templates and mail functionality
- `src/payment/` - Stripe payment integration
- `src/credits/` - Credit system implementation
- `src/analytics/` - Analytics providers
- `content/` - MDX content files for docs and blog
- `messages/` - Translation files (en.json, zh.json) for internationalization
- `docs/requirement/` - Requirements documentation for features
- `public/` - Static assets
- `scripts/` - Operational scripts

## Build, Test, and Development Commands

Install dependencies with `pnpm install` and run `pnpm dev` for the local Next.js server. Use `pnpm build` to produce the optimized bundle and `pnpm start` to serve it. `pnpm lint` triggers Biome checks, while `pnpm format` applies consistent formatting. Database work flows through Drizzle: `pnpm db:generate` emits SQL from the schema, `pnpm db:migrate` applies local changes, and `pnpm db:push` syncs to remote instances. Support tooling includes `pnpm email` for the email previewer and utility scripts such as `pnpm list-users` or `pnpm fix-payments`.

### Core Development
- `pnpm dev` - Start development server with content collections (port 8787)
- `pnpm build` - Build the application and content collections
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter (use for code quality checks)
- `pnpm format` - Format code with Biome

### Development Server
- **Port**: 8787 (not the default 3000) - Always use `http://localhost:8787` for local development

### Database Operations (Drizzle ORM)
- `pnpm db:generate` - Generate new migration files based on schema changes
- `pnpm db:migrate` - Apply pending migrations to the database
- `pnpm db:push` - Sync schema changes directly to the database (development only)
- `pnpm db:studio` - Open Drizzle Studio for database inspection and management

### Content and Email
- `pnpm content` - Process MDX content collections
- `pnpm email` - Start email template development server on port 3333

## Coding Style & Naming Conventions

Biome (`biome.json`) enforces two-space indentation, single quotes, ES5 trailing commas, and required semicolons. Module filenames favour kebab-case (`dashboard-sidebar.tsx`), hooks use the `use-` prefix (`use-session.ts`), and utilities default to named exports. Tailwind utilities live in `src/styles`; extend tokens there instead of scattering magic values. Keep server-only code in files marked with `"use server"` and avoid pulling client hooks into those modules.

## Project Architecture

This is a Next.js full-stack SaaS application with the following key architectural components:

### Core Stack
- **Framework**: Next.js with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with social providers (Google, GitHub)
- **Payments**: Stripe integration with subscription and one-time payments
- **UI**: Radix UI components with TailwindCSS
- **State Management**: Zustand for client-side state
- **Internationalization**: next-intl with English and Chinese locales
- **Content**: Fumadocs for documentation and MDX for content
- **Code Quality**: Biome for formatting and linting

### Authentication & User Management
- Uses Better Auth with PostgreSQL adapter
- Supports email/password and social login (Google, GitHub)
- Includes user management, email verification, and password reset
- Admin plugin for user management and banning
- Automatic newsletter subscription on user creation

### Payment System
- Stripe integration for subscriptions and one-time payments
- Three pricing tiers: Free, Pro (monthly/yearly), and Lifetime
- Credit system with packages for pay-per-use features
- Customer portal for subscription management

### Feature Modules
- **Blog**: MDX-based blog with pagination and categories
- **Docs**: Fumadocs-powered documentation
- **AI Features**: Image generation with multiple providers (OpenAI, Replicate, etc.)
- **Newsletter**: Email subscription system
- **Analytics**: Multiple analytics providers support
- **Storage**: S3 integration for file uploads
- **PDF Tools**: Browser-based PDF processing suite (merge, split, compress, rotate, convert, watermark, etc.)

### Development Workflow
1. Use TypeScript for all new code
2. Follow Biome formatting rules (single quotes, trailing commas)
3. Write server actions in `src/actions/`
4. Use Zustand for client-side state management
5. Implement database changes through Drizzle migrations
6. Use Radix UI components for consistent UI
7. Follow the established directory structure
8. Use proper error handling with error.tsx and not-found.tsx
9. Leverage Next.js features like Server Actions
10. Use `next-safe-action` for secure form submissions

### Configuration
- Main config in `src/config/website.tsx`
- Environment variables template in `env.example`
- Database config in `drizzle.config.ts`
- Biome config in `biome.json` with specific ignore patterns
- TypeScript config with path aliases (@/* for src/*)

## Testing Guidelines

Automated tests are not wired into package scripts, so validate changes with `pnpm dev`, linting, and focused manual QA around auth, billing, and AI flows. When adding a runner, colocate specs with the feature using `.test.ts(x)` or `.spec.ts(x)` suffixes and document the command in your PR. Update `src/db/migrations` with fixtures whenever data changes are needed for reviewers.

### Testing and Quality
- Use Biome for linting and formatting
- TypeScript for type safety
- Environment variables for configuration
- Proper error boundaries and not-found pages
- Zod for runtime validation

## Commit & Pull Request Guidelines

Follow the Conventional Commit style (`feat:`, `fix:`, `chore:`) observed in the log. Keep commits scoped, reference issue IDs in the body, and refresh `env.example` whenever environment variables change. PRs should include a concise summary, testing notes (commands + results), screenshots for UI updates, and callouts for docs or config changes. Request review once checks pass and highlight breaking changes early.

## Configuration & Secrets

Copy `env.example` to `.env` before running commands. Store production credentials with your deployment provider (Vercel, Cloudflare) and never commit secrets. Use scoped API keys for `opennextjs-cloudflare` or `wrangler`, rotate keys tied to providers in `src/ai`, and remove temporary debugging logs before merging.

## Requirements Documentation

**IMPORTANT**: Before working on any task, you MUST read the requirement document at:
- `@docs/requirement/requirement.md` - Contains detailed requirements for features (e.g., PDF tools)

**After making significant changes**, you MUST update the requirement document to keep it in sync with the actual implementation. This includes:
- Adding new tools or features
- Changing existing tool behavior
- Modifying the architecture or data flow
- Updating dependencies or technical approaches
- Adding new pages or routes

## Important Notes

- The project uses pnpm as the package manager
- Database schema is in `src/db/schema.ts` with auth, payment, and credit tables
- Email templates are in `src/mail/templates/`
- The app supports both light and dark themes
- Content is managed through MDX files in the `content/` directory
- The project includes comprehensive internationalization support
