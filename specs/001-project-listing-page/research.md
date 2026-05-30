# Research: TaskFlow Implementation

**Phase**: 0 — Pre-design research
**Date**: 2026-05-30
**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## 1. Authentication Strategy

**Decision**: JWT stored in HTTP-only `Set-Cookie` response header; verified in `middleware.ts` on every protected route.

**Rationale**: HTTP-only cookies prevent XSS-based token theft. The middleware intercepts all `/(dashboard)` routes before the page renders, enforcing authentication at the edge. JWT payload carries `userId` and `exp`; the token is signed with `JWT_SECRET` using HS256. Session expiry is 7 days of inactivity — implemented via `maxAge: 7 * 24 * 60 * 60` on the cookie and a sliding-expiry refresh on each authenticated request.

**Alternatives considered**:

- `next-auth` — rejected: opinionated session model conflicts with constitution's custom authorization logic; harder to return custom 403 vs 401 distinction.
- `localStorage` tokens — rejected: prohibited by constitution (Authentication Rules).
- `sessionStorage` tokens — rejected: same XSS exposure as localStorage; cleared on tab close (poor UX).

**Implementation pattern**:

```
POST /api/auth/login
  → validate credentials (bcryptjs.compare)
  → jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  → Set-Cookie: token=<jwt>; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800
  → { success: true, data: { user } }
```

---

## 2. Authorization Enforcement

**Decision**: Every project-scoped Route Handler calls `project.service.ts#assertMember(projectId, userId)` before executing business logic. Returns 403 if the user is neither owner nor in `members[]`.

**Rationale**: Authorization must be enforced server-side on every request (constitution Authorization Rules). Centralising in the service layer (not in the route handler) means the check cannot be accidentally omitted.

**Pattern**:

```typescript
// project.service.ts
export async function assertMember(projectId: string, userId: string) {
  const project = await Project.findById(projectId).lean();
  if (!project) throw new NotFoundError();
  const isMember =
    project.owner.toString() === userId ||
    project.members.some(m => m.toString() === userId);
  if (!isMember) throw new ForbiddenError();
  return project;
}
```

---

## 3. Kanban Drag-and-Drop with dnd-kit

**Decision**: Use `@dnd-kit/core` + `@dnd-kit/sortable`. Each Kanban column is a `SortableContext`; dragging a card between columns triggers an optimistic status update via TanStack Query's `useMutation` with `onMutate` / `onError` rollback.

**Rationale**: dnd-kit is actively maintained, tree-shakeable, and supports pointer + keyboard events (accessibility). `react-beautiful-dnd` is unmaintained (archived 2023). HTML5 DnD API has no touch support.

**Optimistic update pattern**:

```typescript
const mutation = useMutation({
  mutationFn: (vars: { taskId: string; status: TaskStatus }) =>
    updateTaskStatus(vars),
  onMutate: async vars => {
    await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
    const previous = queryClient.getQueryData(['tasks', projectId]);
    queryClient.setQueryData(['tasks', projectId], old =>
      old.map(t => (t._id === vars.taskId ? { ...t, status: vars.status } : t))
    );
    return { previous };
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(['tasks', projectId], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
  },
});
```

---

## 4. MongoDB Connection Management in Next.js

**Decision**: Use a module-level cached connection in `src/lib/db.ts` to prevent connection pool exhaustion in Next.js development hot-reload and serverless/edge environments.

**Rationale**: Next.js Route Handlers are stateless — each request may re-execute module-level code in dev. Without a cached connection, each hot-reload opens a new Mongoose connection and exhausts the MongoDB Atlas free-tier connection limit.

**Pattern**:

```typescript
// src/lib/db.ts
let cached = (global as any).mongoose ?? { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

---

## 5. Kanban Board — 5th Column: Backlog

**Decision**: Add `"backlog"` as a 5th task status, placing it as the leftmost column. The constitution lists 4 statuses (todo, inprogress, inreview, done); the design reference screenshots show a "Backlog" column.

**Rationale**: The design reference provided by the product owner explicitly shows "Backlog" as the first Kanban column. Since the screenshots are authoritative for UI design (per user instruction), Backlog is included. The spec's acceptance scenarios reference 4 statuses — the existing 4 remain valid; Backlog is additive.

**Status order**: `backlog` → `todo` → `inprogress` → `inreview` → `done`

**Column display labels**:
| Value | Display |
|---|---|
| `backlog` | Backlog |
| `todo` | To Do |
| `inprogress` | In Progress |
| `inreview` | In Review |
| `done` | Done |

---

## 6. Project Card — Color Field

**Decision**: Projects have a `color` string field (hex or Tailwind color token). The Create Project dialog (shown in screenshots) includes a color picker with 8 preset swatches.

**Rationale**: Screenshots show a color swatch picker on the Create Project dialog. Color is stored on the Project model as a hex string (e.g., `#6366f1`). Default: first swatch if not selected.

---

## 7. Registration — Full Name vs First/Last Name

**Decision**: The sign-up UI presents a single "Full Name" field. On submission, the value is split on the first space: `firstName = parts[0]`, `lastName = parts.slice(1).join(' ') || ''`. The User model stores `firstName` and `lastName` separately per the constitution.

**Rationale**: The sign-up screenshot shows a single "Full Name" input. Splitting client-side (with Zod transform) avoids breaking the data model while matching the simplified UI.

---

## 8. Password Visibility Toggle

**Decision**: Implement a show/hide password toggle (eye icon) on all password fields, consistent with the screenshots which show this pattern on both sign-in and sign-up forms.

**Rationale**: Standard UX best practice for password fields; shown in design reference.

---

## 9. API Response Shape

**Decision**: All Route Handlers return:

```json
{ "success": true|false, "data": {}, "message": "..." }
```

`src/lib/api-response.ts` exports `ok(data)`, `created(data)`, `badRequest(msg)`, `unauthorized()`, `forbidden()`, `notFound()`, `serverError(msg)` helpers that return typed `NextResponse` instances.

---

## 10. Environment Variables

**Decision**: A `.env` file is committed with placeholder values. The developer replaces `MONGODB_URI` and `JWT_SECRET` before running.

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Resolved Unknowns Summary

| Was unknown                  | Resolution                                                            |
| ---------------------------- | --------------------------------------------------------------------- |
| Auth token storage mechanism | HTTP-only cookie, 7-day sliding expiry                                |
| Authorization check location | `project.service.ts#assertMember` called in all project/task services |
| MongoDB connection strategy  | Module-level cached singleton in `src/lib/db.ts`                      |
| Kanban status list           | 5 statuses: backlog, todo, inprogress, inreview, done                 |
| Project color field          | Hex string, 8 preset swatches in create/edit dialog                   |
| Registration name field      | Single "Full Name" UI → split to firstName/lastName on submit         |
| Password visibility          | Eye-icon toggle on all password inputs                                |
| API response shape           | `{ success, data?, message? }` from typed helpers                     |
| Environment variables        | `.env` with placeholders committed                                    |
