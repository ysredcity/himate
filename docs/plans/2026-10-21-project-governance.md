# Project Governance Implementation Plan

> For every agent: follow the repository's AGENTS.md and execute this plan in order. This task is already authorized; no additional implementation confirmation is required.

**Goal:** Separate the runnable application from repository governance and provide a portable, consistent handoff process across agents.

**Architecture:** The repository root owns npm workspace orchestration, shared instructions, changelog and documentation. The `app/` workspace owns all application source, public assets, Vite/TypeScript/component configuration and application quality scripts. One root lockfile records dependencies.

**Tech Stack:** Existing Vite 8 / React 19 / TypeScript / Tailwind CSS v4 / Base UI application; npm workspaces; dependency-free Node.js governance checks; Markdown.

---

## Task 1: Record the current baseline

- Inspect `package.json`, `README.md`, `src/components/agent-layout/`, existing docs and preview process.
- Preserve the approved Figma reference, asset manifest and screenshots.
- Identify template-owned historical memory; archive it as reference rather than importing its deployment claims into current context.

## Task 2: Move the application

- Move `src/`, `public/`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `components.json`, `.oxlintrc.json`, `dist/` and `scripts/agent-ux/` into `app/`.
- Move the application manifest to `app/package.json` and name it `@himate/web`.
- Create a private root npm workspace manifest with `dev`, `build`, `lint`, `gate` and `preview` wrappers.
- Retain a single root `package-lock.json`; resolve the existing dependency graph offline without introducing upgrades.
- Stop only this project's running Vite process immediately before migration. Restart from the root after installation.

## Task 3: Establish canonical governance documents

- Create `AGENTS.md`, `CHANGELOG.md`, root `README.md` and lightweight agent-specific entrypoint pointers.
- Create `docs/README.md`, `docs/context/current.md`, `docs/context/handoff.md`, `docs/governance/WORKFLOW.md`, `docs/governance/CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md` and ADR 0001.
- Supply ADR and handoff templates. Document what must be updated for each kind of change and what is intentionally not duplicated.
- Archive template memory and retain the original UED reference with clear provenance.

## Task 4: Add executable governance checks

- Create `scripts/governance/check.mjs` to validate required files, governed local Markdown links, workspace separation and root command routing.
- Include the check in root `npm run gate`.
- Verify that the checker reports missing documents on an isolated incomplete fixture.

## Task 5: Verify and hand off

- Run root governance validation, application lint, scenario validation, token validation, TypeScript checks and build.
- Run the app's own gate from `app/` to verify that it remains independently operable as a workspace directory.
- Start the dev server from the root, verify HTTP 200 and check the homepage in the browser.
- Record actual validation results, remaining limitations and exact next steps in the current context and handoff. Do not claim Git commits, deployments or releases that did not occur.

## Completion

Completed on 2026-10-21 (Asia/Shanghai).

- All five tasks executed; application code is isolated under `app/`.
- Source/public SHA-256 comparison: 132 files unchanged, checked before migration and again after all validation.
- Clean root workspace installation passed offline. No nested lockfile was created.
- Root `npm run gate` and direct `app/` `npm run gate` passed.
- Isolated negative checks correctly rejected a missing context file, broken Markdown link and root-level application source.
- Root dev wrapper started Vite 8.3.5 at port 5173; HTTP 200 and browser homepage verified with no browser errors.
- Existing large-bundle warning remains; security audit was not rerun.
- No Git repository, commits, remote, CI or deployment were created.
