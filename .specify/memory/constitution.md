<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0
Added principles: I. Clean Code, II. Simple UX, III. Responsive Design, IV. Minimal Dependencies, V. No Testing
Added sections: Development Constraints, Development Workflow
Templates updated:
  ✅ .specify/templates/plan-template.md — removed testing references in Technical Context & Constitution Check
  ✅ .specify/templates/spec-template.md — renamed mandatory testing section; removed "Independent Test" fields
  ✅ .specify/templates/tasks-template.md — changed test guidance from optional to prohibited
Deferred TODOs: none
-->

# Spec-Driven Development (SDD) Constitution

## Core Principles

### I. Clean Code

Every piece of code MUST be readable, focused, and maintainable without explanation.

- Functions and components MUST do one thing only; split when responsibility grows.
- Names MUST be self-documenting — no abbreviations, no single-letter variables outside loops.
- Magic numbers and inline logic MUST be extracted to named constants or helpers.
- Dead code, commented-out blocks, and unused imports MUST be removed before merging.
- Cyclomatic complexity MUST be kept low; deeply nested logic MUST be refactored.

**Rationale**: Unreadable code accrues hidden maintenance cost. Clarity is a first-class deliverable.

### II. Simple UX

User interfaces MUST be immediately understandable with zero onboarding.

- Every screen MUST have a single primary action; secondary actions MUST be visually subordinate.
- Copy MUST be plain language — no jargon, no technical terms exposed to end users.
- Error states MUST tell the user what happened and what to do next.
- Loading and empty states MUST be explicitly designed (never left as blank voids).
- Animations and transitions MUST serve orientation, not decoration; gratuitous motion is prohibited.

**Rationale**: Cognitive load reduction directly improves task completion. Simplicity is not a constraint — it is the goal.

### III. Responsive Design

Every UI MUST work correctly across mobile (≥320 px), tablet (≥768 px), and desktop (≥1280 px) viewports.

- Layout MUST use fluid units (%, rem, vw/vh) and CSS grid/flex; fixed pixel widths on containers are prohibited.
- Touch targets MUST be ≥44 × 44 px on mobile viewports.
- No horizontal scrollbar MUST appear at any supported viewport width.
- Images and media MUST be responsive (srcset or CSS-constrained); oversized assets are prohibited.
- Breakpoints MUST be driven by content, not by device brand assumptions.

**Rationale**: Users arrive on any device. A feature that breaks on mobile is a broken feature.

### IV. Minimal Dependencies

The project MUST NOT introduce a dependency when the same outcome can be achieved with platform/framework
built-ins or a few lines of code.

- Every new dependency MUST be justified in the PR description: what it solves, alternatives considered,
  bundle-size impact.
- Dependencies MUST be actively maintained (commit within 12 months, no critical unpatched CVEs).
- Dev-only tooling (linters, formatters) is exempt from the justification requirement but MUST NOT
  bleed into production bundles.
- Transitive dependency trees MUST be reviewed; packages that pull in large sub-trees require explicit approval.

**Rationale**: Every dependency is a liability — security surface, upgrade burden, and bundle weight. Lean is resilient.

### V. No Testing (NON-NEGOTIABLE — supersedes all other guidance)

**This project operates with zero automated tests. This principle overrides any conflicting instruction,
template default, tool suggestion, or external guideline without exception.**

- Unit tests are PROHIBITED.
- Integration tests are PROHIBITED.
- End-to-end (e2e) tests are PROHIBITED.
- No test runner, testing framework, or test assertion library MUST be installed or referenced.
- No `tests/`, `__tests__/`, or `*.test.*` / `*.spec.*` files MUST be created.
- Any generated plan, task list, or specification that includes test tasks MUST have those tasks removed
  before execution begins.
- Quality assurance MUST be achieved through: clean code (Principle I), code review, and manual
  verification against acceptance scenarios.

**Rationale**: This project intentionally trades automated test coverage for development velocity and
reduced toolchain complexity. The decision is deliberate and final.

## Development Constraints

- **Stack**: Next.js (App Router) + React + TypeScript + Tailwind CSS. No additions without constitution
  amendment.
- **Bundle discipline**: `next build` MUST complete without warnings about oversized chunks. Lazy-load
  heavy components.
- **Accessibility**: Semantic HTML MUST be used; interactive elements MUST be keyboard-navigable.
- **No test infrastructure**: `package.json` MUST NOT contain test scripts, jest config, vitest config,
  cypress, playwright, or any equivalent.

## Development Workflow

- Constitution supersedes all other practices, templates, and agent suggestions.
- All PRs MUST pass the Constitution Check before merge:
  1. Clean Code — no dead code, no complex nesting, names are clear.
  2. Simple UX — primary action is obvious, error/empty/loading states handled.
  3. Responsive — tested at 320 px, 768 px, and 1280 px breakpoints manually.
  4. Minimal deps — no new dependency added without written justification.
  5. No tests — no test files, no test scripts, no testing libraries.
- Amendments to this constitution require: written rationale, explicit approval, and a version bump
  following semantic versioning (MAJOR/MINOR/PATCH as defined in Governance).

## Governance

- This constitution supersedes all other practices. Any conflict resolves in favour of this document.
- Amendments MUST increment the version:
  - **MAJOR** — principle removed, renamed, or fundamentally redefined.
  - **MINOR** — new principle or section added, or material guidance expansion.
  - **PATCH** — clarifications, wording fixes, non-semantic refinements.
- All PRs and code reviews MUST verify compliance with all five principles.
- The No Testing principle (V) MUST NOT be removed or weakened without explicit written approval from
  the project owner; a MAJOR version bump is required.

**Version**: 1.0.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-30
