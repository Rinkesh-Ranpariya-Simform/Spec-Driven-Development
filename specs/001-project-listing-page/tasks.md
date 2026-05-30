# Tasks: TaskFlow — Full Application

**Branch**: `001-project-listing-page` | **Date**: 2026-05-30
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md) | **Contracts**: [contracts/api.md](contracts/api.md)

**Tests**: Automated testing is PROHIBITED (Constitution Principle V). No test tasks, no testing framework installation.

## Format

- `[P]` — parallelisable (different files, no unresolved dependencies)
- `[USn]` — user story this task serves
- Every task includes the exact file path(s) to create or modify

---

## Phase 1: Setup

**Purpose**: Install dependencies, initialise tooling, and create the project folder structure.

- [ ] T001 Install runtime dependencies: `npm install mongoose bcryptjs jsonwebtoken @tanstack/react-query @hookform/resolvers react-hook-form zod @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react clsx tailwind-merge` and dev types `npm install --save-dev @types/bcryptjs @types/jsonwebtoken`
- [ ] T002 Initialise shadcn/ui (`npx shadcn@latest init` — Style: Default, Base colour: Slate, CSS variables: Yes) then add components: `npx shadcn@latest add button input label card dialog badge avatar dropdown-menu separator scroll-area tooltip progress`
- [ ] T003 [P] Create `.env.example` and `.env` at project root with variables: `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL` — placeholder values in `.env.example`, real values in `.env` (never commit `.env`)
- [ ] T004 [P] Create directory structure under `src/`: `models/`, `services/`, `lib/validations/`, `types/`, `hooks/`, `components/auth/`, `components/project/`, `components/task/`, `components/kanban/`, `components/members/`, `components/layout/`, `features/`, `actions/` — create `.gitkeep` in each empty dir
- [ ] T005 [P] Verify `tsconfig.json` has `"strict": true`, `"baseUrl": "."`, and `"paths": { "@/*": ["./src/*"] }`; verify `next.config.ts` has no conflicting settings

**Checkpoint**: `npm run dev` starts; `npm run build` completes without TypeScript errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that every user story depends on. No user story work begins until this phase is complete.

⚠️ **CRITICAL**: Complete all foundational tasks before starting any Phase 3+ work.

- [ ] T006 Create MongoDB connection singleton in `src/lib/db.ts` — module-level cached connection using `global` to survive Next.js hot-reload; exports `connectDB(): Promise<typeof mongoose>`
- [ ] T007 [P] Create typed API response helpers in `src/lib/api-response.ts` — exports `ok(data)`, `created(data)`, `badRequest(msg)`, `unauthorized()`, `forbidden()`, `notFound()`, `serverError(msg)` returning `NextResponse<{ success: boolean; data?: unknown; message?: string }>`
- [ ] T008 [P] Create JWT helpers in `src/lib/auth.ts` — exports `signToken(payload)` (HS256, 7d expiry), `verifyToken(token): JwtPayload | null`, `getUserIdFromCookie(request): string | null`
- [ ] T009 [P] Create User Mongoose model in `src/models/User.ts` — fields: `firstName`, `lastName`, `email` (unique, lowercase), `password`, `avatar?`; `{ timestamps: true }`; unique index on `email`
- [ ] T010 [P] Create Project Mongoose model in `src/models/Project.ts` — fields: `name` (max 100), `description?` (max 500), `color` (default `#6366f1`), `owner: ObjectId ref User`, `members: [ObjectId ref User]`; `{ timestamps: true }`; indexes on `owner` and `members`
- [ ] T011 [P] Create Task Mongoose model in `src/models/Task.ts` — fields: `title` (max 200), `description?`, `projectId: ObjectId ref Project`, `status` (enum: backlog/todo/inprogress/inreview/done, default todo), `priority` (enum: low/medium/high/critical, default null), `assignedTo?: ObjectId ref User`, `createdBy: ObjectId ref User`, `dueDate?: Date`; `{ timestamps: true }`; indexes on `projectId` and `(projectId, status)`
- [ ] T012 [P] Create shared TypeScript interfaces in `src/types/user.ts`, `src/types/project.ts`, `src/types/task.ts` — export `IUser`, `IProject`, `ITask` matching Mongoose schemas; export `TaskStatus`, `TaskPriority` const arrays and types; export lean API response shapes (`ProjectWithCounts`, `TaskWithAssignee`, etc.)
- [ ] T013 [P] Create Zod validation schemas in `src/lib/validations/auth.ts` (registerSchema: fullName min 1, email, password min 8 with letter+number regex; loginSchema), `src/lib/validations/project.ts` (createProjectSchema, updateProjectSchema), `src/lib/validations/task.ts` (createTaskSchema, updateTaskSchema)
- [ ] T014 Create `src/middleware.ts` — intercept all `/(dashboard)` routes; call `getUserIdFromCookie`; redirect to `/sign-in` if no valid JWT; refresh the cookie expiry on every authenticated request (sliding 7-day expiry) by re-signing and re-setting the token; pass `x-user-id` header to downstream route handlers. **Security note**: the `x-user-id` header is set exclusively here; Route Handlers MUST only trust it when processed through middleware (Next.js middleware strips incoming `x-user-id` headers from external requests by default — verify this behaviour in `next.config.ts` if needed).
- [ ] T015 [P] Update `src/app/layout.tsx` — wrap children in `QueryClientProvider` (TanStack Query); set `<html lang="en" className="dark">`; apply global Tailwind base styles from `globals.css`
- [ ] T016 [P] Create `src/app/(dashboard)/page.tsx` — server component that redirects to `/projects` using `redirect('/projects')`

**Checkpoint**: Foundation ready — `connectDB` resolves; models compile; middleware redirects unauthenticated requests.

---

## Phase 3: User Story 1 — User Registration and Sign-In (Priority: P1) 🎯 MVP

**Goal**: Visitors can register an account and sign in; authenticated sessions are protected by HTTP-only JWT cookies; sign-out clears the session.

**Independent Test**: Open the app unauthenticated → confirm redirect to `/sign-in`. Register with valid details → confirm redirect to `/sign-in`. Sign in → confirm redirect to `/projects`. Revisit `/sign-in` while authenticated → confirm redirect to `/projects`. Sign out → confirm redirect to `/sign-in` and `/projects` is inaccessible.

- [ ] T017 [P] [US1] Create auth service in `src/services/auth.service.ts` — `registerUser({ fullName, email, password })`: split fullName, check duplicate email (throw 400), hash password with bcryptjs (cost 12), create User document, return safe user (no password); `loginUser({ email, password })`: find user by email, bcrypt.compare, return safe user or throw 401
- [ ] T018 [P] [US1] Create `src/app/api/auth/register/route.ts` — POST: parse body with registerSchema, call `authService.registerUser`, set JWT cookie via `signToken`, return `created({ user })`
- [ ] T019 [P] [US1] Create `src/app/api/auth/login/route.ts` — POST: parse body with loginSchema, call `authService.loginUser`, set JWT cookie, return `ok({ user })`
- [ ] T020 [P] [US1] Create `src/app/api/auth/logout/route.ts` — POST: clear `token` cookie (Max-Age=0), return `ok({ message: 'Logged out' })`
- [ ] T021 [US1] Create `src/app/(auth)/layout.tsx` — server component; if JWT cookie is valid redirect to `/projects`; otherwise render children inside a full-page centered dark container matching design reference
- [ ] T022 [US1] Create `src/components/auth/sign-up-form.tsx` — client component; React Hook Form + registerSchema (Zod); fields: Full Name, Work Email, Password (with show/hide toggle); on submit POST `/api/auth/register`; on success `router.push('/projects')`; show field-level errors; "Already have an account? Sign in" link
- [ ] T023 [US1] Create `src/app/(auth)/sign-up/page.tsx` — renders `<SignUpForm />`; heading "Create your account", subheading "Start tracking your team's work today"
- [ ] T024 [US1] Create `src/components/auth/sign-in-form.tsx` — client component; React Hook Form + loginSchema; fields: Email, Password (with show/hide toggle); on submit POST `/api/auth/login`; on success `router.push('/projects')`; "Don't have an account? Sign up" link; demo credentials footer line
- [ ] T025 [US1] Create `src/app/(auth)/sign-in/page.tsx` — renders `<SignInForm />`; heading "Welcome back", subheading "Sign in to your TaskFlow account"

---

## Phase 4: User Story 2 — Project Listing Page (Priority: P1) 🎯 MVP

**Goal**: Authenticated users see only their own projects (owned + member); non-members are blocked; empty state is shown when no projects exist; direct URL access to foreign projects is denied.

**Independent Test**: Sign in → confirm project listing shows only owned/member projects. Create a second account with no projects → confirm empty state. Manually navigate to a project URL belonging to the first user → confirm 403 / redirect.

- [ ] T026 [US2] Create project service in `src/services/project.service.ts` — `assertMember(projectId, userId)`: find project, throw 404 if not found, throw 403 if user is not owner or member, return project (**this must be called in every project-scoped and task-scoped service function before any data is returned**); `getProjectsByUser(userId)`: find all projects where `owner = userId OR members includes userId`, populate owner and members, attach task counts from Task model; `getProjectById(projectId, userId)`: assertMember then return populated project
- [ ] T027 [US2] Create `src/app/api/projects/route.ts` GET handler — extract `userId` from `x-user-id` header set by middleware; call `getProjectsByUser`; return `ok({ projects })`
- [ ] T028 [US2] Create `src/app/(dashboard)/layout.tsx` — server layout; reads current user from JWT cookie for initial render; renders `<Sidebar>` + `<Header>` flanking `{children}`; apply dark background
- [ ] T029 [P] [US2] Create `src/components/layout/sidebar.tsx` — client component; logo ("TaskFlow") + lightning bolt icon; nav links: Dashboard, Projects, Tasks, Analytics, Team; "RECENT PROJECTS" section listing last 3 projects; "ACCOUNT / Settings" at bottom; highlights active route
- [ ] T030 [P] [US2] Create `src/components/layout/header.tsx` — shows breadcrumb (e.g. "Projects"), notification bell icon, user avatar with initials, sign-out dropdown trigger
- [ ] T031 [P] [US2] Create `src/hooks/use-projects.ts` — TanStack Query hook `useProjects()`: GET `/api/projects`, returns `{ projects, isLoading, error }`; `useInvalidateProjects()` helper for mutations
- [ ] T032 [P] [US2] Create `src/components/project/project-card.tsx` — displays color-coded top border, project icon, name, status badge (Planning/In Progress/Completed derived from task %), description, task count, progress bar, created date, "View →" link to `/projects/[id]`
- [ ] T033 [P] [US2] Create `src/components/project/project-list.tsx` — renders grid of `<ProjectCard>`; when empty, shows empty state: icon + "No projects yet" + "Create your first project to get started" + create button
- [ ] T034 [US2] Create `src/app/(dashboard)/projects/page.tsx` — server component; renders page heading "Projects", project count subtitle, `<ProjectList />`, and "+ New Project" button in top-right corner

---

## Phase 5: User Story 3 — Creating a Project (Priority: P2)

**Goal**: Authenticated users can create projects with name, description, and color; creator becomes owner; project appears in listing immediately.

**Independent Test**: Click "+ New Project", fill name + description, pick a colour, submit → confirm new project card appears in listing with chosen colour. Submit without a name → confirm validation error.

- [ ] T035 [US3] Extend `src/services/project.service.ts` with `createProject(userId, data)`: create Project document with `owner = userId`, `members = []`; return created project
- [ ] T036 [US3] Add POST handler to `src/app/api/projects/route.ts` — parse body with createProjectSchema; call `createProject`; return `created({ project })`
- [ ] T037 [P] [US3] Create `src/app/api/projects/[projectId]/route.ts` — GET: call `getProjectById(projectId, userId)` which internally calls `assertMember` before returning any data (FR-006 compliance); PUT: owner-only `updateProject(projectId, userId, data)` in service; DELETE: owner-only `deleteProject(projectId, userId)` in service (cascades Task deletion with `Task.deleteMany({ projectId })`)
- [ ] T038 [US3] Extend `src/services/project.service.ts` with `updateProject(projectId, userId, data)` (assertOwner, patch fields), `deleteProject(projectId, userId)` (assertOwner, delete tasks, delete project)
- [ ] T039 [US3] Create `src/components/project/create-project-dialog.tsx` — client component; shadcn `Dialog`; React Hook Form + createProjectSchema; fields: Project Name (required), Description (optional textarea), Color (8 hex swatches as radio buttons matching screenshots); on submit POST `/api/projects`; on success invalidate projects query + close dialog
- [ ] T040 [P] [US3] Create `src/components/project/edit-project-dialog.tsx` — same form pre-filled with existing project data; on submit PUT `/api/projects/[id]`; on success invalidate projects query
- [ ] T041 [P] [US3] Create `src/components/project/delete-project-dialog.tsx` — shadcn `AlertDialog`; warning text "This will permanently delete the project and all X tasks. This action cannot be undone."; confirm button triggers DELETE `/api/projects/[id]`; on success redirect to `/projects`
- [ ] T042 [US3] Wire "+ New Project" button in `src/app/(dashboard)/projects/page.tsx` to open `<CreateProjectDialog>`; wire Edit Project and Delete Project actions from project overflow menu

---

## Phase 6: User Story 4 — Managing Project Members (Priority: P2)

**Goal**: Project owner can add registered users as members via type-ahead search and remove them; non-owners see the members list but not the add/remove controls; added members gain project visibility.

**Independent Test**: As owner, open members panel → add a second user → sign in as that user and confirm project appears in their listing. As owner, remove that user → sign in as removed user and confirm project is gone. Sign in as a member and confirm add/remove controls are absent.

- [ ] T043 [US4] Extend `src/services/project.service.ts` with `getMembersWithOwner(projectId, userId)` (assertMember, populate owner + members), `addMember(projectId, ownerId, newUserId)` (assertOwner, duplicate check, push to members[]), `removeMember(projectId, ownerId, targetUserId)` (assertOwner, prevent owner self-removal, pull from members[])
- [ ] T044 [US4] Create `src/app/api/projects/[projectId]/members/route.ts` — GET: `getMembersWithOwner`; POST: `addMember`; DELETE: `removeMember` (userId in body)
- [ ] T045 [P] [US4] Create user service in `src/services/user.service.ts` — `searchUsers(query, limit = 10)`: case-insensitive regex on firstName, lastName, email; returns safe user objects (no password)
- [ ] T046 [P] [US4] Create `src/app/api/users/search/route.ts` — GET with query param `q`; call `searchUsers`; return `ok({ users })`
- [ ] T047 [P] [US4] Create `src/hooks/use-members.ts` — `useMembers(projectId)`: TanStack Query GET `/api/projects/[id]/members`; `useAddMember`, `useRemoveMember` mutation hooks with query invalidation
- [ ] T048 [P] [US4] Create `src/components/members/member-list.tsx` — shows each member row with avatar (initials), full name, email, "Owner" badge for owner, remove button (visible only to owner, disabled for owner row); empty state "No members added yet — add your first team member"
- [ ] T049 [US4] Create `src/components/members/add-member-dialog.tsx` — shadcn `Dialog`; search input triggers debounced GET `/api/users/search?q=`; renders suggestion list with avatar + name; selecting a user calls `addMember` mutation; filters out already-member users client-side; shows "already a member" if dupe attempted
- [ ] T050 [US4] Create `src/app/(dashboard)/projects/[projectId]/members/page.tsx` — renders `<MemberList>` + "+ Add Member" button (owner only) opening `<AddMemberDialog>`; back link to board

---

## Phase 7: User Story 5 — Creating and Managing Tasks (Priority: P3)

**Goal**: Project members and owners can create, edit, and delete tasks; assignee list is filtered to project members; task status and priority are selectable; non-members are denied access.

**Independent Test**: Navigate to a project board. Click "+ Add Task", fill required title, assign to a member, set priority → confirm task appears. Edit task, change status → confirm updated value. Attempt to assign a non-member → confirm non-member is absent from dropdown.

- [ ] T051 [US5] Create task service in `src/services/task.service.ts` — `getTasksByProject(projectId, userId)`: assertMember, return tasks with assignedTo populated; `createTask(userId, data)`: assertMember on data.projectId, validate assignedTo is member if provided, create Task; `updateTask(taskId, userId, data)`: assertMember on task's project, update fields; `deleteTask(taskId, userId)`: assertMember, delete task
- [ ] T052 [P] [US5] Create `src/app/api/tasks/route.ts` — GET `?projectId=`: `getTasksByProject`; POST: `createTask`
- [ ] T053 [P] [US5] Create `src/app/api/tasks/[taskId]/route.ts` — GET: return single task; PUT: `updateTask`; DELETE: `deleteTask`
- [ ] T054 [P] [US5] Create `src/hooks/use-tasks.ts` — `useTasks(projectId)`: TanStack Query GET `/api/tasks?projectId=`; `useCreateTask`, `useUpdateTask`, `useDeleteTask` mutation hooks; all mutations invalidate `['tasks', projectId]`
- [ ] T055 [P] [US5] Create `src/components/task/task-card.tsx` — shows title, priority colour dot (gray/blue/orange/red/dark-red), assignee avatar with initials, due date badge (red if overdue); clicking card opens `<EditTaskDialog>`; draggable handle for dnd-kit (implemented in US6)
- [ ] T056 [US5] Create `src/components/task/create-task-dialog.tsx` — shadcn `Dialog`; React Hook Form + createTaskSchema; fields: Title\* (text), Description (textarea), Status (select, default "To Do"), Priority (select, default "No Priority"), Assignee (select filtered to project members, "Unassigned" option), Due Date (date input); on submit `useCreateTask`; on success close dialog; "Create Task" primary button
- [ ] T057 [US5] Create `src/components/task/edit-task-dialog.tsx` — same form pre-filled from existing task; on submit `useUpdateTask`; delete task button (destructive, with confirmation) triggers `useDeleteTask` + close

---

## Phase 8: User Story 6 — Kanban Board (Priority: P3)

**Goal**: Project Kanban board shows tasks grouped into 5 columns; members can drag cards between columns to update status; changes are reflected immediately (optimistic update with rollback on failure); empty columns show an empty state.

**Independent Test**: Open project board → confirm tasks appear in correct columns. Drag a task from "To Do" to "In Progress" → confirm card moves immediately. Refresh page → confirm status persisted. Drag to same column → no change. Open a project with no tasks → confirm all columns show empty state message.

- [ ] T058 [US6] Create `src/components/kanban/kanban-column.tsx` — receives `status`, `tasks[]`, `isOwner` props; renders column header with coloured underline, status label, task count badge, `+` add-task button; maps tasks to `<SortableTaskCard>` wrappers; empty state "No tasks in this column — click + to add one" when `tasks.length === 0`; uses `useDroppable` from dnd-kit
- [ ] T059 [P] [US6] Create `src/components/kanban/kanban-drag-overlay.tsx` — renders a `<TaskCard>` inside dnd-kit `DragOverlay` during active drag for visual feedback
- [ ] T060 [US6] Create `src/components/kanban/kanban-board.tsx` — client component; receives `projectId`, `isOwner`; calls `useTasks(projectId)`; groups tasks by status into 5 buckets (backlog/todo/inprogress/inreview/done); wraps board in `DndContext` with `PointerSensor`; `onDragEnd`: if column changed, call `useUpdateTask` mutation with optimistic update (cancel query, snapshot previous, set new status in cache) and rollback on error; renders 5 `<KanbanColumn>` side-by-side with horizontal scroll on overflow
- [ ] T061 [US6] Create project Kanban board page `src/app/(dashboard)/projects/[projectId]/page.tsx` — server component; verifies membership (redirect to `/projects` if 403); passes `projectId` and `isOwner` to `<KanbanBoard>`; renders top action bar: breadcrumb "Projects > [name]", `+ Add Task` button opening `<CreateTaskDialog>`, `+ Add Member` button (owner only), `...` overflow menu with "Edit Project" and "Delete Project" actions

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Visual polish, responsive layout, empty states, error handling, and loading states per constitution principles II, III.

- [ ] T062 [P] Create project layout with tab navigation in `src/app/(dashboard)/projects/[projectId]/layout.tsx` — renders project name in breadcrumb; tab links: Board (`/projects/[id]`), Members (`/projects/[id]/members`); highlights active tab; "Add Task" and "Add Member" buttons in header. (List view tab is out of scope for this version; remove `list/` from folder structure if created.)
- [ ] T063 [P] Create loading skeletons — `src/app/(dashboard)/projects/loading.tsx` (skeleton cards), `src/app/(dashboard)/projects/[projectId]/loading.tsx` (skeleton columns); use shadcn `Skeleton` component
- [ ] T064 [P] Create error and not-found pages — `src/app/error.tsx` (generic client error boundary with retry button), `src/app/not-found.tsx` (404 with back-to-projects link)
- [ ] T065 [P] Verify all FR-022 empty states are implemented: projects listing (T033), each Kanban column (T058), member list (T048); add any missing empty state UI
- [ ] T066 [P] Ensure responsive layout: sidebar hides on mobile (hamburger menu or bottom nav), Kanban board has `overflow-x: auto` with min-column width so it scrolls horizontally on narrow screens; all touch targets ≥44×44 px
- [ ] T067 [P] Final validation — run `npm run build`; fix any TypeScript errors or lint warnings; verify no test files, no test scripts in `package.json`, no `jest.config` or `vitest.config`
- [ ] T068 Verify sliding session refresh in `src/middleware.ts` — confirm the cookie `Max-Age` is reset on every authenticated request; manually test that signing in and remaining active keeps the session alive beyond 7 days idle; confirm an inactive session is rejected after 7 days
- [ ] T069 [P] Remove `src/app/(dashboard)/projects/[projectId]/list/` directory from the project structure (list view is out of scope for v1 per Clarifications); ensure the Board tab is the default and only non-member view available

---

## Dependencies (User Story Completion Order)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← ALL stories blocked until complete
    ↓
Phase 3 (US1: Auth) ← All dashboard stories blocked until sign-in works
    ↓
Phase 4 (US2: Project Listing) ← Required before US3, US4
    ↓
Phase 5 (US3: Create Project)  ←─┐
Phase 6 (US4: Members)            ├── Can run in parallel after Phase 4
    ↓                          ←─┘
Phase 7 (US5: Tasks) ← Requires project + membership to exist
Phase 8 (US6: Board) ← Requires tasks service (US5)
    ↓
Phase 9 (Polish)
```

**Independent stories**: US3 and US4 are independent of each other after Phase 4. US5 and US6 depend on US3+US4 (need a project with members to assign tasks). US6 depends on US5 (needs task cards and status updates).

---

## Parallel Execution Examples

### Within Phase 3 (US1 — Auth):

T017, T018, T019, T020 can all run in parallel (different files). T021 must complete before T022 and T023 can be tested visually.

### Within Phase 4 (US2 — Listing):

T026 (service) → T027 (route). T029, T030, T031, T032, T033 can all run in parallel with each other.

### Across Phase 5 and Phase 6:

After Phase 4 is complete, T035–T042 (US3) and T043–T050 (US4) can be implemented by separate developers simultaneously.

---

## Implementation Strategy

**MVP Scope** (Phases 1–4, stories US1 + US2): After completing Phases 1–4, the app is deployable and demonstrates its core value proposition — secure, per-user project visibility with authentication.

**Increment 2** (Phases 5–6, stories US3 + US4): Full project lifecycle — create, edit, delete, manage membership.

**Increment 3** (Phases 7–8, stories US5 + US6): Task management + Kanban board — the daily-use workflow.

**Increment 4** (Phase 9): Polish, responsiveness, error/loading states.

---

## Summary

| Phase               | User Story    | Tasks        | Parallelisable         |
| ------------------- | ------------- | ------------ | ---------------------- |
| 1 — Setup           | —             | T001–T005    | T003, T004, T005       |
| 2 — Foundation      | —             | T006–T016    | T007–T016              |
| 3 — Auth            | US1 (P1)      | T017–T025    | T017–T020              |
| 4 — Project Listing | US2 (P1)      | T026–T034    | T028–T033              |
| 5 — Create Project  | US3 (P2)      | T035–T042    | T037, T040, T041       |
| 6 — Members         | US4 (P2)      | T043–T050    | T045–T048              |
| 7 — Tasks           | US5 (P3)      | T051–T057    | T052–T055              |
| 8 — Kanban Board    | US6 (P3)      | T058–T061    | T059                   |
| 9 — Polish          | —             | T062–T069    | T062–T066, T069        |
| **Total**           | **6 stories** | **69 tasks** | **~42 parallelisable** |
