# API Contracts: TaskFlow

**Phase**: 1 — Design
**Date**: 2026-05-30
**Feature**: [spec.md](../spec.md) | **Data Model**: [../data-model.md](../data-model.md)

## Conventions

All responses follow:

```json
{ "success": true | false, "data": <payload>, "message": "<human-readable string>" }
```

Authentication is via HTTP-only JWT cookie (`token`). All endpoints except `POST /api/auth/register` and `POST /api/auth/login` require a valid cookie.

HTTP status codes:

- `200` — success (read/update/delete)
- `201` — success (created)
- `400` — validation error
- `401` — not authenticated
- `403` — authenticated but not authorised
- `404` — resource not found
- `500` — server error

---

## Auth

### POST /api/auth/register

Register a new user.

**Request body**:

```json
{
  "fullName": "Alex Johnson",
  "email": "alex@example.com",
  "password": "secret123"
}
```

**Validation** (Zod):

- `fullName`: non-empty string
- `email`: valid email, unique
- `password`: min 8 chars, ≥1 letter + ≥1 number

**Success `201`**:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "Alex",
    "lastName": "Johnson",
    "email": "alex@example.com"
  }
}
```

**Error `400`**: email already in use or validation failure
**Sets cookie**: `token=<jwt>; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`

---

### POST /api/auth/login

Sign in with email and password.

**Request body**:

```json
{
  "email": "alex@example.com",
  "password": "secret123"
}
```

**Success `200`**:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "Alex",
    "lastName": "Johnson",
    "email": "alex@example.com"
  }
}
```

**Error `401`**: invalid credentials
**Sets cookie**: same as register

---

### POST /api/auth/logout

Clear the auth cookie.

**Success `200`**:

```json
{ "success": true, "message": "Logged out" }
```

**Clears cookie**: `token` set to empty with `Max-Age=0`

---

## Projects

### GET /api/projects

List all projects the authenticated user owns or is a member of.

**Success `200`**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Mobile App v2",
      "description": "Next generation mobile experience",
      "color": "#10b981",
      "owner": { "_id": "...", "firstName": "Alex", "lastName": "Johnson" },
      "members": [{ "_id": "...", "firstName": "Jane", "lastName": "Smith" }],
      "taskCount": 4,
      "completedTaskCount": 2,
      "createdAt": "2026-03-10T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/projects

Create a new project.

**Request body**:

```json
{
  "name": "Website Redesign",
  "description": "Optional description",
  "color": "#6366f1"
}
```

**Validation**: `name` required (max 100); `color` must be a valid hex string from preset list

**Success `201`**:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Website Redesign",
    "color": "#6366f1",
    "owner": "...",
    "members": []
  }
}
```

---

### GET /api/projects/[projectId]

Get a single project with its members. Requires membership.

**Success `200`**: Same shape as single project object above (with members populated)

**Error `403`**: Not a member

---

### PUT /api/projects/[projectId]

Edit project name, description, or color. Owner only.

**Request body**: any subset of `{ name, description, color }`

**Success `200`**: Updated project object

**Error `403`**: Not owner

---

### DELETE /api/projects/[projectId]

Delete project and all its tasks. Owner only. Requires confirmed intent (enforced in UI; API executes unconditionally once called).

**Success `200`**:

```json
{ "success": true, "message": "Project deleted" }
```

**Error `403`**: Not owner

---

### GET /api/projects/[projectId]/members

List all members (owner + members[]) of the project. Requires membership.

**Success `200`**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "firstName": "Alex",
      "lastName": "Johnson",
      "email": "alex@example.com",
      "isOwner": true
    },
    {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "isOwner": false
    }
  ]
}
```

---

### POST /api/projects/[projectId]/members

Add a member to the project. Owner only.

**Request body**:

```json
{ "userId": "<ObjectId>" }
```

**Validation**: `userId` must be a valid ObjectId; user must exist; must not already be a member

**Success `200`**: Updated members array

**Error `400`**: User already a member
**Error `403`**: Not owner
**Error `404`**: User not found

---

### DELETE /api/projects/[projectId]/members

Remove a member from the project. Owner only.

**Request body**:

```json
{ "userId": "<ObjectId>" }
```

**Validation**: User must be a current member (cannot remove owner)

**Success `200`**: Updated members array

**Error `400`**: Cannot remove project owner / User not a member
**Error `403`**: Not owner

---

## Tasks

### GET /api/tasks?projectId=[projectId]

List all tasks for a project. Requires project membership.

**Query param**: `projectId` (required)

**Success `200`**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Define app architecture",
      "description": "",
      "projectId": "...",
      "status": "inprogress",
      "priority": "high",
      "assignedTo": {
        "_id": "...",
        "firstName": "Alex",
        "lastName": "Johnson"
      },
      "createdBy": "...",
      "dueDate": null,
      "createdAt": "..."
    }
  ]
}
```

---

### POST /api/tasks

Create a task within a project. Requires project membership.

**Request body**:

```json
{
  "title": "Define app architecture",
  "description": "optional",
  "projectId": "...",
  "status": "todo",
  "priority": "high",
  "assignedTo": "<userId or null>",
  "dueDate": "2026-06-15T00:00:00.000Z"
}
```

**Validation**:

- `title` required
- `projectId` required, must be a project the user belongs to
- `status` optional (default: `todo`), must be one of the 5 valid values
- `priority` optional, must be one of 4 valid values or null
- `assignedTo` optional; if provided, must be project owner or member

**Success `201`**: Created task object

---

### PUT /api/tasks/[taskId]

Update any field of a task. Requires project membership.

**Request body**: any subset of task fields (same schema as POST)

**Success `200`**: Updated task object

**Error `403`**: Not a project member

---

### DELETE /api/tasks/[taskId]

Delete a task. Requires project membership.

**Success `200`**:

```json
{ "success": true, "message": "Task deleted" }
```

---

## Users

### GET /api/users/search?q=[query]

Search registered users by name or email. Used for the member-picker type-ahead. Returns up to 10 results. Requires authentication.

**Query param**: `q` — partial name or email string (min 1 char)

**Success `200`**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    }
  ]
}
```

**Note**: Results exclude users already members of the project being edited (filtering done client-side using the current members list).
