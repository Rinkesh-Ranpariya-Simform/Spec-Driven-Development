# Feature Specification: TaskFlow — Project Listing Page

**Feature Branch**: `001-project-listing-page`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "project-listing-page - TaskFlow collaborative project management application — project listing page and full application foundation including authentication, project management, member management, task management, and Kanban board."

## User Scenarios _(mandatory)_

### User Story 1 - User Registration and Sign-In (Priority: P1)

A new user creates an account by providing their full name, email address, and password. The system stores the full name as separate first and last name fields internally. After registering, the user signs in using their email and password to access the application. Unauthenticated users cannot access any project functionality.

**Why this priority**: Authentication is the entry point to the entire application. No other feature is accessible without it, making it the most critical building block.

**Manual Verification**: Navigate to the registration page, fill in the required fields (full name, email, password), and submit. Confirm the account is created and the user is redirected to sign in. Sign in with the registered credentials and confirm access to the projects page.

**Acceptance Scenarios**:

1. **Given** a visitor is on the registration page, **When** they provide a valid full name, email, and password, **Then** their account is created and they can sign in.
2. **Given** a visitor attempts to register with an email already in use, **When** they submit the form, **Then** the system rejects the registration with a clear error message.
3. **Given** a registered user is on the sign-in page, **When** they enter their correct email and password, **Then** they are signed in and directed to the projects listing page.
4. **Given** a user attempts to access a protected page without signing in, **When** the request is made, **Then** they are redirected to the sign-in page.
5. **Given** a signed-in user has finished their session, **When** they sign out, **Then** they can no longer access protected pages without signing in again.

---

### User Story 2 - Viewing the Project Listing Page (Priority: P1)

An authenticated user lands on the projects page after signing in. The page shows only the projects they own or belong to as a member. Projects they have no association with are never visible.

**Why this priority**: The project listing page is the central hub of the application. All work starts here, and its access-control guarantee is a core security requirement.

**Manual Verification**: Sign in as User A who owns Project X and is a member of Project Y. Confirm only Project X and Project Y appear in the listing. Sign in as User B who has no projects. Confirm the listing is empty or shows an appropriate empty state.

**Acceptance Scenarios**:

1. **Given** a signed-in user owns or is a member of one or more projects, **When** they visit the projects page, **Then** only those projects are displayed.
2. **Given** a signed-in user has no project associations, **When** they visit the projects page, **Then** an appropriate empty state message is shown with guidance to create a project.
3. **Given** Project Z exists but User A is not its owner or member, **When** User A views the projects page or performs a search, **Then** Project Z never appears in any results.
4. **Given** a signed-in user navigates directly to a project URL they do not belong to, **When** the page loads, **Then** access is denied and no project data is revealed.

---

### User Story 3 - Creating a Project (Priority: P2)

An authenticated user creates a new project by providing a project name and description. The user automatically becomes the project owner, and the project immediately appears in their listing.

**Why this priority**: Creating projects is the primary productive action users take after signing in. It unlocks all downstream collaboration features.

**Manual Verification**: Sign in, click the create project action, provide a name and description, and submit. Confirm the new project appears in the listing and the current user is recognised as its owner.

**Acceptance Scenarios**:

1. **Given** a signed-in user provides a project name and description, **When** they submit the form, **Then** the project is created and they are designated as its owner.
2. **Given** a newly created project, **When** the owner views the projects listing, **Then** the new project appears in the list.
3. **Given** a user attempts to create a project without a name, **When** they submit the form, **Then** the system rejects the request with a clear validation message.

---

### User Story 4 - Managing Project Members (Priority: P2)

A project owner searches for registered users by name or email and adds them as members. The owner can also remove any member from the project. Only the owner can perform these actions; members cannot manage membership.

**Why this priority**: Membership management gates all collaboration. Tasks can only be assigned to members, and the listing page enforces visibility based on membership.

**Manual Verification**: Sign in as the project owner. Navigate to the project settings or members panel. Search for another registered user and add them. Confirm the added user can now see the project. Remove the user and confirm the project no longer appears in their listing. Sign in as a member and confirm the add/remove member controls are absent.

**Acceptance Scenarios**:

1. **Given** a project owner selects a registered user not already in the project, **When** they add that user as a member, **Then** the user appears in the project's member list and can access the project.
2. **Given** a project owner selects an existing project member, **When** they remove that member, **Then** the user is removed and can no longer access the project.
3. **Given** a user is already a member, **When** an owner attempts to add them again, **Then** the system prevents the duplicate and shows an appropriate message.
4. **Given** a project member views the membership panel, **When** they look for add or remove controls, **Then** those controls are not available to them.

---

### User Story 5 - Creating and Managing Tasks (Priority: P3)

Any project member or owner can create tasks within a project. Each task requires a title, and optionally a description, status, priority, assignee, and due date. Tasks may only be assigned to users who belong to the same project. Members can update tasks and change their statuses as work progresses.

**Why this priority**: Task creation and management is the day-to-day work of the application. It depends on projects and membership being established first.

**Manual Verification**: Navigate to a project. Create a task with a title, description, and priority. Assign it to a project member. Confirm non-members do not appear in the assignee list. Update the task status. Confirm the change is reflected on the board and task detail.

**Acceptance Scenarios**:

1. **Given** a signed-in member of a project, **When** they create a task with a title, **Then** the task is created with a default status of "Todo."
2. **Given** a task is being created or edited, **When** the assignee field is populated, **Then** only current project members appear as options.
3. **Given** a task exists, **When** a member updates its status to any valid value (Todo, In Progress, In Review, Done), **Then** the new status is saved and visible.
4. **Given** a task exists, **When** a member sets its priority (Low, Medium, High, Critical), **Then** the priority is saved and visible.
5. **Given** a non-member of the project, **When** they attempt to access or modify a task, **Then** access is denied.

---

### User Story 6 - Viewing and Using the Kanban Board (Priority: P3)

Each project includes a Kanban board that organises tasks into five columns by status: Backlog, Todo, In Progress, In Review, and Done. Members can drag tasks between columns to update their status. Changes are reflected immediately within the current user's session.

**Why this priority**: The Kanban board is the primary visual workflow tool. It depends on tasks being created and statuses being defined.

**Manual Verification**: Navigate to the Kanban board for a project. Confirm tasks appear under the correct status column. Drag a task from "Todo" to "In Progress." Confirm the task moves and its status updates. Refresh the page and confirm the status change persists.

**Acceptance Scenarios**:

1. **Given** a project has tasks with various statuses, **When** a member opens the Kanban board, **Then** tasks appear grouped under their respective status columns.
2. **Given** a member drags a task card from one column to another, **When** the drop is confirmed, **Then** the task's status is updated and the board reflects the change immediately.
3. **Given** a task has no assignee or due date, **When** it is displayed on the board, **Then** the card renders without those fields causing errors.
4. **Given** a Kanban column contains no tasks, **When** a member views the board, **Then** the empty column is displayed with a helpful empty state message.

---

### Edge Cases

- What happens when a project owner is the only member and attempts to leave or delete the project? (Assumption: deletion proceeds and all project tasks are permanently removed.)
- How does the listing page behave when a user belongs to a very large number of projects?
- What happens when a task's assigned member is subsequently removed from the project?
- How does the board handle a column with no tasks?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST allow visitors to register an account using a full name, email address, and password. The full name is stored internally as separate first and last name fields. Passwords MUST be at least 8 characters long and contain at least one letter and one number.
- **FR-002**: The system MUST prevent registration with an email address already associated with an existing account.
- **FR-003**: The system MUST allow registered users to sign in using their email address and password.
- **FR-004**: The system MUST restrict access to all project functionality to authenticated users only. A signed-in session uses a sliding expiry: the session token is refreshed on every authenticated request and expires after 7 days of inactivity, after which the user must sign in again.
- **FR-005**: The system MUST display only projects that the signed-in user owns or is a member of on the project listing page.
- **FR-006**: The system MUST never expose projects, project details, or project data to users who are not associated with that project — including via direct URL navigation or API. (Note: task and project search are out of scope for this version; this requirement applies to all current access paths.)
- **FR-007**: Authenticated users MUST be able to create a project by providing a name and description.
- **FR-008**: The user who creates a project MUST automatically be assigned the role of project owner.
- **FR-009**: Only the project owner MUST be able to add members to or remove members from the project.
- **FR-010**: Members MUST be selected from existing registered users only; invitation or account creation during member addition is out of scope.
- **FR-011**: The system MUST prevent adding a user to a project if they are already a member.
- **FR-012**: Project members and owners MUST be able to create tasks within a project.
- **FR-013**: Each task MUST have a title and status; description, priority, assignee, and due date are optional at creation.
- **FR-014**: Task status MUST be one of: Backlog, Todo, In Progress, In Review, Done. Default status at creation is Todo. The Backlog status represents work that is identified but not yet scheduled.
- **FR-015**: Task priority MUST be one of: Low, Medium, High, Critical. A task may also have no priority assigned (displayed as "No Priority"); when a priority is set it MUST be one of the four values.
- **FR-016**: Tasks MAY only be assigned to users who are current members or the owner of the same project.
- **FR-017**: Project members and owners MUST be able to update any task's fields and change its status.
- **FR-018**: Each project MUST include a Kanban board that displays tasks grouped by status in five columns: Backlog, Todo, In Progress, In Review, and Done.
- **FR-019**: Users MUST be able to move tasks between Kanban columns, and doing so MUST update the task's status immediately.
- **FR-020**: Only the project owner MUST be able to delete a project. Before deletion, the system MUST display a confirmation dialog clearly warning that all tasks will be permanently deleted. Deleting a project MUST permanently remove all tasks belonging to that project.
- **FR-021**: Only the project owner MUST be able to edit project information (name, description, and color).
- **FR-022**: The system MUST display an appropriate empty state message wherever a list or board has no items to show, including: the project listing page (no projects), the task list or Kanban board (no tasks in the project), any Kanban column (no tasks in that status), and the member list (no members other than the owner).

### Key Entities

- **User**: Represents a registered person. Attributes: full name (stored as first name + last name), email address, password (hashed). A user can own multiple projects and be a member of multiple projects.
- **Project**: A container for collaborative work. Attributes: name, description, color, owner (User reference), members (list of User references stored as an embedded array on the Project). A project has one owner and zero or more members. Membership uniqueness is enforced at the project level — a user can only appear once in the members list.
- **Task**: A unit of work within a project. Attributes: title, description, status (Backlog / Todo / In Progress / In Review / Done), priority (Low / Medium / High / Critical / No Priority), assignee (project member, optional), due date (optional). Belongs to exactly one project.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete account registration and sign in within 2 minutes on their first visit.
- **SC-002**: The project listing page loads and displays only the current user's accessible projects with no unauthorised data leakage across all test scenarios.
- **SC-003**: A project owner can add a new member and that member can access the project within a single session without a page reload beyond navigation.
- **SC-004**: Task creation and status changes are reflected on the Kanban board within the same page session immediately after the action.
- **SC-005**: 100% of direct URL access attempts to projects by non-members result in access denial with no project data returned.
- **SC-006**: All five task statuses (Backlog, Todo, In Progress, In Review, Done) and four priority levels (Low, Medium, High, Critical) plus No Priority are selectable and persist correctly after save.
- **SC-007**: The project listing never shows more projects than the user is authorised to see, verified through both UI navigation and direct URL access.

## Clarifications

### Session 2026-05-30

- Q: What password requirements should be enforced at registration? → A: Minimum 8 characters, at least one letter and one number.
- Q: Should the system confirm before permanently deleting a project? → A: Yes — show a confirmation dialog warning that all tasks will be permanently deleted.
- Q: Should tasks be filterable or searchable on the board or task list? → A: No — filtering and search are out of scope for this version; all tasks are always shown.
- Q: How long should a signed-in session last before automatic sign-out? → A: Sliding expiry — session token is refreshed on each authenticated request and expires after 7 days of inactivity.

## Assumptions

- Users access TaskFlow through a standard web browser; native mobile apps are out of scope for this version.
- Email address is unique per user account; there is no social login or single sign-on requirement at this stage.
- Member search/selection is performed from the pool of all registered users; there is no invite-by-email flow.
- When a member is removed from a project, tasks already assigned to them remain in the project but become unassigned.
- When a project is deleted, all tasks belonging to that project are permanently deleted as well.
- The project owner cannot be removed from their own project; transferring ownership is out of scope for this version.
- Real-time collaboration (live multi-user board updates without refresh) is a desired quality but the spec does not mandate WebSocket technology — immediate reflection within the same user's session is the baseline requirement.
- Pagination or infinite scroll for large project or task lists is a technical concern left to implementation; the spec requires all accessible items to be reachable.
- Task filtering, sorting, and search are out of scope for this version; all tasks belonging to a project are always displayed.
