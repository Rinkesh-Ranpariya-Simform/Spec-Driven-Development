# Data Model: TaskFlow

**Phase**: 1 — Design
**Date**: 2026-05-30
**Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

## Entities

### User

Represents a registered person who can own or be a member of projects.

| Field       | Type     | Constraints                       | Notes                                   |
| ----------- | -------- | --------------------------------- | --------------------------------------- |
| `_id`       | ObjectId | auto                              | MongoDB document ID                     |
| `firstName` | String   | required, trim                    | Split from "Full Name" on registration  |
| `lastName`  | String   | required, trim                    | May be empty string if single-word name |
| `email`     | String   | required, unique, lowercase, trim | Used for sign-in and member search      |
| `password`  | String   | required                          | bcryptjs hash; never returned from APIs |
| `avatar`    | String   | optional                          | URL or null; future feature             |
| `createdAt` | Date     | auto                              | Mongoose timestamps                     |
| `updatedAt` | Date     | auto                              | Mongoose timestamps                     |

**Validation rules**:

- Email must match RFC 5322 format (Zod `z.string().email()`)
- Password must be ≥8 characters with at least one letter and one number (validated before hashing)
- `firstName` must be non-empty

**Indexes**: `{ email: 1 }` unique

---

### Project

A container for collaborative work owned by one user and accessible to a set of members.

| Field         | Type                   | Constraints                    | Notes                                                                             |
| ------------- | ---------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| `_id`         | ObjectId               | auto                           | MongoDB document ID                                                               |
| `name`        | String                 | required, trim, maxLength: 100 |                                                                                   |
| `description` | String                 | optional, trim, maxLength: 500 |                                                                                   |
| `color`       | String                 | required, default: `#6366f1`   | Hex color string from 8 preset swatches                                           |
| `owner`       | ObjectId (ref: User)   | required                       | Set to creator's `_id` on creation                                                |
| `members`     | ObjectId[] (ref: User) | default: []                    | Does NOT include owner (owner is implicitly a member for auth; stored separately) |
| `createdAt`   | Date                   | auto                           | Mongoose timestamps                                                               |
| `updatedAt`   | Date                   | auto                           | Mongoose timestamps                                                               |

**Business rules**:

- On creation: `owner` is set to the authenticated user's `_id`; `members` starts empty
- Authorization check: user is considered a member if `owner.equals(userId) || members.includes(userId)`
- `members` array enforces uniqueness at the service layer (Zod + service check before push)
- Only `owner` may add/remove from `members`, edit project fields, or delete the project
- Deleting a project cascades: all Tasks with `projectId === project._id` are deleted

**Indexes**: `{ owner: 1 }`, `{ members: 1 }`

---

### Task

A unit of work belonging to exactly one project.

| Field         | Type                    | Constraints                     | Notes                                                                |
| ------------- | ----------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `_id`         | ObjectId                | auto                            | MongoDB document ID                                                  |
| `title`       | String                  | required, trim, maxLength: 200  |                                                                      |
| `description` | String                  | optional, trim, maxLength: 2000 |                                                                      |
| `projectId`   | ObjectId (ref: Project) | required                        | Parent project                                                       |
| `status`      | Enum (String)           | required, default: `'todo'`     | One of: `backlog`, `todo`, `inprogress`, `inreview`, `done`          |
| `priority`    | Enum (String)           | optional, default: `null`       | One of: `low`, `medium`, `high`, `critical`, or `null` (No Priority) |
| `assignedTo`  | ObjectId (ref: User)    | optional                        | Must be project owner or member at assignment time                   |
| `createdBy`   | ObjectId (ref: User)    | required                        | Set to authenticated user's `_id` on creation                        |
| `dueDate`     | Date                    | optional                        |                                                                      |
| `createdAt`   | Date                    | auto                            | Mongoose timestamps                                                  |
| `updatedAt`   | Date                    | auto                            | Mongoose timestamps                                                  |

**Status values & display labels**:

| Value        | Display     | Column colour (UI) |
| ------------ | ----------- | ------------------ |
| `backlog`    | Backlog     | Gray               |
| `todo`       | To Do       | Blue               |
| `inprogress` | In Progress | Yellow/Amber       |
| `inreview`   | In Review   | Purple             |
| `done`       | Done        | Green              |

**Priority values & display labels**:

| Value      | Display     | Indicator colour (UI) |
| ---------- | ----------- | --------------------- |
| `null`     | No Priority | Gray                  |
| `low`      | Low         | Blue                  |
| `medium`   | Medium      | Orange                |
| `high`     | High        | Red                   |
| `critical` | Critical    | Dark Red              |

**Business rules**:

- `assignedTo` must be the project owner or appear in `project.members` at the time of assignment
- `createdBy` must be the project owner or appear in `project.members`
- Removing a member from a project does NOT change existing task assignments (tasks become unassigned in display only — the reference remains but the user is no longer a project member)
- Deleting a project deletes all tasks with matching `projectId`

**Indexes**: `{ projectId: 1 }`, `{ projectId: 1, status: 1 }`

---

## Entity Relationships

```
User ──────────────────────────────────────────────────────────────┐
 │  (owner)                                                         │
 │          1:many                                                  │
 ▼                                                                  │
Project ◄──── members[] (many-to-many via embedded array) ─────────┘
 │
 │  1:many (cascade delete)
 ▼
Task ──── assignedTo ──► User
     └─── createdBy  ──► User
```

**No separate ProjectMembership collection**: Membership is stored as an embedded `members: ObjectId[]` array on Project. This avoids a join and keeps authorization checks O(1) with a MongoDB index on the members array. The spec describes ProjectMembership as a logical entity; the implementation collapses it into the Project document.

---

## Mongoose Schema Definitions (reference)

### User Schema

```typescript
const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);
```

### Project Schema

```typescript
const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    color: { type: String, required: true, default: '#6366f1' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);
```

### Task Schema

```typescript
const STATUSES = ['backlog', 'todo', 'inprogress', 'inreview', 'done'] as const;
const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    status: { type: String, enum: STATUSES, required: true, default: 'todo' },
    priority: { type: String, enum: PRIORITIES, default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);
```

---

## State Transitions

### Task Status Flow

```
backlog ──► todo ──► inprogress ──► inreview ──► done
   ▲          ▲           ▲              ▲
   └──────────┴───────────┴──────────────┘
         (any column → any column via drag or edit)
```

All transitions are valid in both directions. There is no enforced linear progression — users can drag tasks to any column.

---

## Derived / Computed Values (UI-only, not stored)

| Value                  | Source                                                                          | Used in                   |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------- |
| Task count per project | `COUNT(tasks WHERE projectId = project._id)`                                    | Project card              |
| Completion %           | `COUNT(done tasks) / COUNT(all tasks) * 100`                                    | Project card progress bar |
| Member avatar initials | `firstName[0] + lastName[0]`                                                    | Member list, task card    |
| Project "status" label | Derived from task completion % (0%=Planning, 1-99%=In Progress, 100%=Completed) | Project card badge        |
