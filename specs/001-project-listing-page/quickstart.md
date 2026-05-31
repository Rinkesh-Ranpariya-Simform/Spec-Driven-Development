# Quickstart: TaskFlow Development Environment

**Date**: 2026-05-30
**Branch**: `001-project-listing-page`

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+
- A MongoDB Atlas account (free tier is sufficient) or a local MongoDB 7+ instance
- Git

---

## 1. Clone and Install

```bash
git clone <repo-url>
cd sdd
npm install
```

---

## 2. Install Additional Dependencies

The base Next.js scaffold is already present. Install the remaining runtime dependencies:

```bash
npm install mongoose bcryptjs jsonwebtoken @tanstack/react-query \
  react-hook-form @hookform/resolvers zod \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  lucide-react clsx tailwind-merge
```

Install shadcn/ui CLI and initialise:

```bash
npx shadcn@latest init
```

When prompted, select:

- Style: **Default**
- Base color: **Slate** (matches the dark theme)
- CSS variables: **Yes**

Add required shadcn/ui components:

```bash
npx shadcn@latest add button input label card dialog badge avatar \
  dropdown-menu separator scroll-area tooltip progress
```

Install TypeScript type definitions:

```bash
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

---

## 3. Configure Environment Variables

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret-minimum-32-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Never commit `.env` with real credentials.** Only `.env.example` (with placeholder values) is committed.

---

## 4. Configure TypeScript Path Aliases

Verify `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first visit, unauthenticated users are redirected to `/sign-in`. Register a new account to begin.

---

## 6. Project Structure Quick Reference

```
src/
├── app/              Next.js App Router pages and Route Handlers
├── components/       Shared UI components (auth, project, task, kanban, layout)
├── features/         Domain logic co-located with features
├── hooks/            TanStack Query hooks (use-projects, use-tasks, use-members)
├── lib/              db.ts, auth.ts, validations/, api-response.ts
├── models/           Mongoose models (User, Project, Task)
├── services/         Business logic (auth, project, task, user services)
├── types/            Shared TypeScript interfaces
├── actions/          Server Actions (if used for mutations)
└── middleware.ts     JWT cookie verification on /(dashboard) routes
```

---

## 7. Key Conventions

| Convention                  | Rule                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| Server vs Client Components | Server by default; add `"use client"` only when interactivity (state, events, dnd) is required       |
| API response shape          | Always `{ success, data?, message? }` via `src/lib/api-response.ts` helpers                          |
| Authorization               | Every project/task service function calls `assertMember(projectId, userId)` before DB operations     |
| Passwords                   | Hashed with bcryptjs (cost factor 12); never returned from any API                                   |
| Form validation             | Zod schemas in `src/lib/validations/`; used both client (React Hook Form) and server (Route Handler) |
| DB connection               | `connectDB()` from `src/lib/db.ts` called at the top of every Route Handler                          |
| No testing                  | Do not create `*.test.ts`, `*.spec.ts`, or any test runner configuration                             |

---

## 8. Manual Verification Checklist (before /speckit.tasks)

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes without TypeScript errors or oversized chunk warnings
- [ ] Registration form creates a user (verify in MongoDB Atlas UI or `mongosh`)
- [ ] Sign-in sets an HTTP-only `token` cookie (verify in DevTools → Application → Cookies)
- [ ] Visiting `/projects` without a cookie redirects to `/sign-in`
- [ ] Creating a project appears in the project listing
- [ ] A non-member cannot access `/projects/[projectId]` (receives 403)
