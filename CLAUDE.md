# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Khatantan is an LMS (Learning Management System) marketplace for wellness, spirituality, and personal development courses targeting Mongolia. The UI is in French. Three user roles: `student`, `instructor`, `admin`.

## Commands

```bash
npm run dev          # Vite dev server (http://localhost:3001)
npm run build        # Production build
npm run preview      # Preview production build
npm run db:types     # Regenerate Supabase types (needs SUPABASE_PROJECT_ID env var)
```

No test framework or linter is configured.

## Tech Stack

- **React 19** + **TypeScript 5.9** (strict mode)
- **Vite 7** with `@tailwindcss/vite` plugin (Tailwind CSS v4 — no tailwind.config.js)
- **TanStack Router** (file-based routing with auto code-splitting from `src/routes/`)
- **TanStack React Query** (server state)
- **Supabase** (PostgreSQL, Auth, Storage)
- **Radix UI** + **CVA** for component variants
- **TipTap** for rich text editing
- **sonner** for toasts

## Architecture

### Routing (`src/routes/`)

Routes are auto-generated into `src/routeTree.gen.ts` by the TanStack Router Vite plugin. Route guards live in layout routes:

| Layout | Path prefix | Purpose |
|--------|------------|---------|
| `_public.tsx` | `/` | Public pages (no auth required) |
| `_auth.tsx` | `/login`, `/register` | Auth forms (redirects if logged in) |
| `_app.tsx` | `/dashboard`, `/my-learning`, etc. | Student area (requires auth) |
| `instructor/` | `/instructor/*` | Instructor panel (role: instructor/admin) |
| `admin/` | `/admin/*` | Admin panel (role: admin) |
| `learn/` | `/learn/$courseSlug/$lessonId` | Course player |

### Data Layer (`src/services/database.ts`)

Custom `SupabaseDatabase` class wrapping the Supabase client with:
- Complex filtering (AND/OR logical operators, operators: eq, ne, gt, ilike, in, etc.)
- Nested relationship includes (`include: { courses: { include: { modules: true } } }`)
- Pagination with metadata

**Query hook** — `useDatabaseQuery(query)`:
```tsx
const { data, isLoading } = useDatabaseQuery({
  from: "enrollments",
  where: { field: "student_id", operator: "eq", value: user?.id ?? "" },
  include: { courses: true },
  orderBy: [{ field: "enrolled_at", direction: "desc" }],
});
```

**Mutation hook** — `useDatabaseMutation({ table })`:
```tsx
const { createRow, updateRow, deleteRow } = useDatabaseMutation({ table: "courses" });
await createRow({ data: { title, slug } });
await updateRow({ id, data: { status: "published" } });
```
Mutations auto-invalidate all queries for that table.

### Auth (`src/contexts/Auth.tsx`)

- Supabase email/password auth
- `useAuth()` returns `{ user, profile, role, isLoading, signOut }`
- Profile has: `role`, `display_name`, `avatar_url`, `bio`, `xp`
- Role check hook: `useRequireRole("instructor")` in `src/hooks/use-require-role.ts`

### File Uploads (`src/utilities/useFileUpload.ts`)

```tsx
const { onClick, onChange, onDrop, fileInputRef, isLoading } = useFileUpload({
  bucket: "profile-avatars",
  folder: user?.id ?? "",
  onSuccess: (file) => setAvatarUrl(file.url),
});
```

## Styling

- **Source CSS**: `src/index.css` imports Tailwind + `src/theme.css`
- **Theme**: CSS variables in `src/theme.css` with rose palette (`oklch(0.645 0.246 16.439)`)
- **Fonts**: Playfair Display (serif, titles) + Lato (sans, body) loaded via Google Fonts in `index.html`
- **Dark mode**: `.dark` class via `next-themes`, CSS variable overrides in theme.css
- **Utility**: `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)
- **Component variants**: CVA in `src/components/ui/` (e.g., button.tsx has size/variant props)

## Key Conventions

- All UI text is in **French**
- Prices are in Mongolian Tugrik (₮), stored as `price_cents` (integer)
- Course URLs use slugs: `/courses/$courseSlug`
- Layouts combine: top navbar + left sidebar + content + footer (authenticated pages)
- Database queries use the custom `useDatabaseQuery`/`useDatabaseMutation` hooks, not raw Supabase calls
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`

## Core Entities

Profiles, Courses (with modules/lessons), Enrollments (with progress), Categories, Certificates, Badges, Instructor Profiles, Favorites.
