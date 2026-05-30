# Implementation Plan: TaskFlow — Full Application

**Branch**: `001-project-listing-page` | **Date**: 2026-05-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-project-listing-page/spec.md`

## Summary

Build TaskFlow, a full-stack collaborative project management application on Next.js App Router. The application covers: JWT authentication (HTTP-only cookies), project CRUD with per-user visibility enforcement, project membership management, task lifecycle management, and a drag-and-drop Kanban board. The UI follows a dark, minimal design language (Linear/Notion-inspired) using shadcn/ui, with all server state managed via TanStack Query and optimistic updates on drag operations via dnd-kit.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode throughout)

**Primary Dependencies**: Next.js 14+ (App Router), React 18, Tailwind CSS, shadcn/ui (Radix UI), React Hook Form, Zod, TanStack Query v5, dnd-kit, Mongoose 8, bcryptjs, jsonwebtoken

**Storage**: MongoDB (via Mongoose ODM, `timestamps: true` on all models)

**Testing**: N/A — automated testing is prohibited by constitution (Principle V)

**Target Platform**: Web browser, fluid layout from 320 px to 1280 px+

**Project Type**: Full-stack web application (Next.js monorepo — Route Handlers as API backend)

**Performance Goals**: Project listing page loads in <2 s; Kanban drag operations update UI optimistically (<100 ms perceived latency), persisted within 500 ms; session expiry at 7 days idle

**Constraints**: JWT stored exclusively in HTTP-only cookies (no localStorage); no Redux; no Context API for server state; Mongoose only (no other ORM); bcryptjs for all password hashing; passwords never returned from any API

**Scale/Scope**: Team collaboration tool; tens of projects per user; hundreds of tasks per project; all accessible items fetched without pagination in v1

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **I. Clean Code** — Service layer architecture (Route Handler → Service → Model) enforces separation; components capped at 1000 lines; no dead code policy
- [x] **II. Simple UX** — Each screen has one primary action (sign-in, create project, create task, drag card); all empty/loading/error states explicitly designed per FR-022
- [x] **III. Responsive Design** — Tailwind fluid units throughout; sidebar collapses on mobile; Kanban board scrolls horizontally on small viewports; touch targets ≥44×44 px
- [x] **IV. Minimal Dependencies** — All 10 runtime deps are justified in research.md; no dep added without written rationale
- [x] **V. No Testing (NON-NEGOTIABLE)** — No test files, no jest/vitest/playwright, no test scripts in package.json

**Post-Design Re-check**: See bottom of Phase 1 section — all checks remain green after data model and contracts are defined.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-listing-page/
├── plan.md              # This file
├── research.md          # Phase 0 — dependency justifications & decisions
├── data-model.md        # Phase 1 — entity definitions & relationships
├── quickstart.md        # Phase 1 — dev environment setup
├── contracts/           # Phase 1 — API contracts (Route Handler schemas)
└── tasks.md             # Phase 2 — /speckit.tasks output (not created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + auth guard
│   │   ├── projects/
│   │   │   ├── page.tsx         # Project listing page
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx     # Kanban board (default view)
│   │   │       └── members/
│   │   │           └── page.tsx # Members panel
│   │   └── page.tsx             # Redirect → /projects
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       ├── projects/
│       │   ├── route.ts          # GET list, POST create
│       │   └── [projectId]/
│       │       ├── route.ts      # GET, PUT, DELETE
│       │       └── members/
│       │           └── route.ts  # GET, POST add, DELETE remove
│       ├── tasks/
│       │   ├── route.ts          # POST create
│       │   └── [taskId]/
│       │       └── route.ts      # GET, PUT, DELETE
│       └── users/
│           └── search/route.ts   # GET search users (member picker)
├── components/
│   ├── ui/                       # shadcn/ui primitives (auto-generated)
│   ├── auth/
│   │   ├── sign-in-form.tsx
│   │   └── sign-up-form.tsx
│   ├── project/
│   │   ├── project-card.tsx
│   │   ├── project-list.tsx
│   │   ├── create-project-dialog.tsx
│   │   └── edit-project-dialog.tsx
│   ├── task/
│   │   ├── task-card.tsx
│   │   ├── create-task-dialog.tsx
│   │   └── edit-task-dialog.tsx
│   ├── kanban/
│   │   ├── kanban-board.tsx
│   │   ├── kanban-column.tsx
│   │   └── kanban-drag-overlay.tsx
│   ├── members/
│   │   ├── member-list.tsx
│   │   └── add-member-dialog.tsx
│   └── layout/
│       ├── sidebar.tsx
│       └── header.tsx
├── features/                     # Domain logic co-located with UI
│   ├── auth/
│   ├── projects/
│   ├── tasks/
│   └── members/
├── hooks/
│   ├── use-projects.ts
│   ├── use-tasks.ts
│   └── use-members.ts
├── lib/
│   ├── db.ts                     # MongoDB connection singleton
│   ├── auth.ts                   # JWT sign/verify helpers
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   └── task.ts
│   └── api-response.ts           # Typed { success, data, message } helper
├── models/
│   ├── User.ts
│   ├── Project.ts
│   └── Task.ts
├── services/
│   ├── auth.service.ts
│   ├── project.service.ts
│   ├── task.service.ts
│   └── user.service.ts
├── types/
│   ├── user.ts
│   ├── project.ts
│   └── task.ts
├── actions/                      # Server Actions (if used for mutations)
└── middleware.ts                 # JWT cookie verification on protected routes
```

**Structure Decision**: Single Next.js monorepo. App Router handles both the React UI (Server + Client Components) and the REST API (Route Handlers). This avoids a separate backend process and simplifies deployment. The `src/` convention is used throughout per `tsconfig.json` path aliases.

## Dependency Justifications

| Dependency              | Justification                                                                                 | Alternative Rejected                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `next`                  | Full-stack framework; App Router gives server components, route handlers, middleware          | Separate Express backend — adds deployment complexity                                    |
| `mongoose`              | Type-safe ODM for MongoDB; `timestamps`, validation, ObjectId refs built-in                   | Raw `mongodb` driver — no schema validation, verbose                                     |
| `bcryptjs`              | Industry-standard password hashing; pure JS, no native bindings                               | `argon2` — requires native bindings; `crypto.scrypt` — lower-level, more boilerplate     |
| `jsonwebtoken`          | JWT sign/verify; pairs with HTTP-only cookie strategy                                         | `next-auth` — opinionated, harder to customise authorization logic                       |
| `zod`                   | Schema validation at API boundaries and form level; infer TypeScript types                    | `yup` — weaker TypeScript inference; manual validation — error-prone                     |
| `react-hook-form`       | Minimal re-renders on form input; integrates with Zod via `@hookform/resolvers`               | Controlled components with `useState` — verbose, full re-render on each keystroke        |
| `@tanstack/react-query` | Server state cache, loading/error/stale states, optimistic updates                            | `useEffect` + `useState` — no cache, no deduplication, manual loading states             |
| `dnd-kit`               | Accessible drag-and-drop with pointer and keyboard support; tree-shakeable                    | `react-beautiful-dnd` — unmaintained; HTML5 DnD API — no touch support, no accessibility |
| `shadcn/ui`             | Radix UI primitives + Tailwind; fully owned, not a runtime dep — copied into `components/ui/` | `chakra-ui` / `mantine` — runtime bundle weight; raw Radix — more wiring per component   |
| `tailwindcss`           | Utility-first CSS; zero-runtime; consistent spacing scale; responsive breakpoints built-in    | CSS Modules — verbose; styled-components — runtime overhead                              |

## Complexity Tracking

| Justification                                   | Why Needed                                                                                                    | Simpler Alternative Rejected Because                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Service layer (Route Handler → Service → Model) | Keeps route handlers thin; business logic (auth checks, member validation) is reusable across multiple routes | Direct DB calls in route handlers — duplicates auth/authorization logic across every endpoint |
| TanStack Query + optimistic updates             | Kanban drag UX requires instant feedback; rollback on failure is required by constitution (Kanban Rules)      | `fetch` + `useState` — no optimistic update primitive; manual rollback is brittle             |
