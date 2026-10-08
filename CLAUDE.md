# LibreChat

## Project Overview

LibreChat is a monorepo with the following key workspaces:

| Workspace | Language | Side | Dependency | Purpose |
|---|---|---|---|---|
| `/api` | JS (legacy) | Backend | `packages/api`, `packages/data-schemas`, `packages/data-provider`, `@librechat/agents` | Express server — minimize changes here |
| `/packages/api` | **TypeScript** | Backend | `packages/data-schemas`, `packages/data-provider` | New backend code lives here (TS only, consumed by `/api`) |
| `/packages/data-schemas` | TypeScript | Backend | `packages/data-provider` | Database models/schemas, shareable across backend projects |
| `/packages/data-provider` | TypeScript | Shared | — | Shared API types, endpoints, data-service — used by both frontend and backend |
| `/client` | TypeScript/React | Frontend | `packages/data-provider`, `packages/client` | Frontend SPA |
| `/packages/client` | TypeScript | Frontend | `packages/data-provider` | Shared frontend utilities |

The source code for `@librechat/agents` (major backend dependency, same team) is at `/home/danny/agentus`.

---

## Workspace Boundaries

- **All new backend code must be TypeScript** in `/packages/api`.
- Keep `/api` changes to the absolute minimum (thin JS wrappers calling into `/packages/api`).
- Database-specific shared logic goes in `/packages/data-schemas`.
- Frontend/backend shared API logic (endpoints, types, data-service) goes in `/packages/data-provider`.
- Build data-provider from project root: `npm run build:data-provider`.

---

## Code Style

### Naming and File Organization

- **Single-word file names** whenever possible (e.g., `permissions.ts`, `capabilities.ts`, `service.ts`).
- When multiple words are needed, prefer grouping related modules under a **single-word directory** rather than using multi-word file names (e.g., `admin/capabilities.ts` not `adminCapabilities.ts`).
- The directory already provides context — `app/service.ts` not `app/appConfigService.ts`.

### Structure and Clarity

- **Never-nesting**: early returns, flat code, minimal indentation. Break complex operations into well-named helpers.
- **Functional first**: pure functions, immutable data, `map`/`filter`/`reduce` over imperative loops. Only reach for OOP when it clearly improves domain modeling or state encapsulation.
- **No dynamic imports** unless absolutely necessary.

### DRY

- Extract repeated logic into utility functions.
- Reusable hooks / higher-order components for UI patterns.
- Parameterized helpers instead of near-duplicate functions.
- Constants for repeated values; configuration objects over duplicated init code.
- Shared validators, centralized error handling, single source of truth for business rules.
- Shared typing system with interfaces/types extending common base definitions.
- Abstraction layers for external API interactions.

### Iteration and Performance

- **Minimize looping** — especially over shared data structures like message arrays, which are iterated frequently throughout the codebase. Every additional pass adds up at scale.
- Consolidate sequential O(n) operations into a single pass whenever possible; never loop over the same collection twice if the work can be combined.
- Choose data structures that reduce the need to iterate (e.g., `Map`/`Set` for lookups instead of `Array.find`/`Array.includes`).
- Avoid unnecessary object creation; consider space-time tradeoffs.
- Prevent memory leaks: careful with closures, dispose resources/event listeners, no circular references.

### Type Safety

- **Never use `any`**. Explicit types for all parameters, return values, and variables.
- **Limit `unknown`** — avoid `unknown`, `Record<string, unknown>`, and `as unknown as T` assertions. A `Record<string, unknown>` almost always signals a missing explicit type definition.
- **Don't duplicate types** — before defining a new type, check whether it already exists in the project (especially `packages/data-provider`). Reuse and extend existing types rather than creating redundant definitions.
- Use union types, generics, and interfaces appropriately.
- All TypeScript and ESLint warnings/errors must be addressed — do not leave unresolved diagnostics.

### Comments and Documentation

- Write self-documenting code; no inline comments narrating what code does.
- JSDoc only for complex/non-obvious logic or intellisense on public APIs.
- Single-line JSDoc for brief docs, multi-line for complex cases.
- Avoid standalone `//` comments unless absolutely necessary.

### Import Order

Imports are organized into three sections:

1. **Package imports** — sorted shortest to longest line length (`react` always first).
2. **`import type` imports** — sorted longest to shortest (package types first, then local types; length resets between sub-groups).
3. **Local/project imports** — sorted longest to shortest.

Multi-line imports count total character length across all lines. Consolidate value imports from the same module. Always use standalone `import type { ... }` — never inline `type` inside value imports.

### JS/TS Loop Preferences

- **Limit looping as much as possible.** Prefer single-pass transformations and avoid re-iterating the same data.
- `for (let i = 0; ...)` for performance-critical or index-dependent operations.
- `for...of` for simple array iteration.
- `for...in` only for object property enumeration.

---

## Frontend Rules (`client/src/**/*`)

### Localization

- All user-facing text must use `useLocalize()`.
- Only update English keys in `client/src/locales/en/translation.json` (other languages are automated externally).
- Semantic key prefixes: `com_ui_`, `com_assistants_`, etc.

### Components

- TypeScript for all React components with proper type imports.
- Semantic HTML with ARIA labels (`role`, `aria-label`) for accessibility.
- Group related components in feature directories (e.g., `SidePanel/Memories/`).
- Use index files for clean exports.

### Data Management

- Feature hooks: `client/src/data-provider/[Feature]/queries.ts` → `[Feature]/index.ts` → `client/src/data-provider/index.ts`.
- React Query (`@tanstack/react-query`) for all API interactions; proper query invalidation on mutations.
- QueryKeys and MutationKeys in `packages/data-provider/src/keys.ts`.

### Data-Provider Integration

- Endpoints: `packages/data-provider/src/api-endpoints.ts`
- Data service: `packages/data-provider/src/data-service.ts`
- Types: `packages/data-provider/src/types/queries.ts`
- Use `encodeURIComponent` for dynamic URL parameters.

### Performance

- Prioritize memory and speed efficiency at scale.
- Cursor pagination for large datasets.
- Proper dependency arrays to avoid unnecessary re-renders.
- Leverage React Query caching and background refetching.

---

## Development Commands

| Command | Purpose |
|---|---|
| `npm run smart-reinstall` | Install deps (if lockfile changed) + build via Turborepo |
| `npm run reinstall` | Clean install — wipe `node_modules` and reinstall from scratch |
| `npm run backend` | Start the backend server |
| `npm run backend:dev` | Start backend with file watching (development) |
| `npm run build` | Build all compiled code via Turborepo (parallel, cached) |
| `npm run frontend` | Build all compiled code sequentially (legacy fallback) |
| `npm run frontend:dev` | Start frontend dev server with HMR (port 3090, requires backend running) |
| `npm run build:data-provider` | Rebuild `packages/data-provider` after changes |

- Node.js: v20.19.0+ or ^22.12.0 or >= 23.0.0
- Database: MongoDB
- Backend runs on `http://localhost:3080/`; frontend dev server on `http://localhost:3090/`

---

## Testing

- Framework: **Jest**, run per-workspace.
- Run tests from their workspace directory: `cd api && npx jest <pattern>`, `cd packages/api && npx jest <pattern>`, etc.
- Frontend tests: `__tests__` directories alongside components; use `test/layout-test-utils` for rendering.
- Cover loading, success, and error states for UI/data flows.

### Philosophy

- **Real logic over mocks.** Exercise actual code paths with real dependencies. Mocking is a last resort.
- **Spies over mocks.** Assert that real functions are called with expected arguments and frequency without replacing underlying logic.
- **MongoDB**: use `mongodb-memory-server` for a real in-memory MongoDB instance. Test actual queries and schema validation, not mocked DB calls.
- **MCP**: use real `@modelcontextprotocol/sdk` exports for servers, transports, and tool definitions. Mirror real scenarios, don't stub SDK internals.
- Only mock what you cannot control: external HTTP APIs, rate-limited services, non-deterministic system calls.
- Heavy mocking is a code smell, not a testing strategy.

---

## Formatting

Fix all formatting lint errors (trailing spaces, tabs, newlines, indentation) using auto-fix when available. All TypeScript/ESLint warnings and errors **must** be resolved.

---

# AYANA Fork

This repo is AYANA's fork of [danny-avila/LibreChat](https://github.com/danny-avila/LibreChat) (`origin` = `qdhayana/LibreChat`, `upstream` = `danny-avila/LibreChat`). The product is branded **AYANA GPT**.

## Instruction Files

- This `CLAUDE.md` is the **primary** source of project rules. The sections above are the LibreChat conventions we follow (workspaces, code style, testing, commands).
- `AGENTS.md` is upstream's own, since-rewritten instruction file. Treat it as a **secondary reference**: read it for extra context, but if it conflicts with this file, `CLAUDE.md` wins.
- Upstream gitignores `CLAUDE.md` and deleted its copy, so this file is tracked here with `git add -f`. Do not edit `AGENTS.md` for AYANA guidance, which keeps upstream syncs conflict-free.

## Branch Model

- `main` mirrors upstream; never commit AYANA changes to it.
- `ayana` is the deployed branch: `main` plus one squashed customization commit (`adjustment`). Local `ayana-*` branches and `mcp-test` are old backups/experiments; ignore them.
- Sync flow: update `main` from `upstream/main`, then merge `main` into `ayana` and resolve conflicts.
- **Keep the fork delta small.** Prefer config (`librechat.yaml`, `.env`) over code edits. Every changed upstream file is a future merge conflict.
- Version tags come from upstream (e.g. `v0.8.x`); `Dockerfile` carries the upstream version comment.

## What `ayana` Changes vs `main`

Verify with `git diff main ayana --stat`. Code changes are intentionally minimal:

| Area | Change |
|---|---|
| Branding | Title/PWA name `AYANA GPT` in `client/index.html` (note: also still has upstream's `<title>LibreChat</title>`), `client/src/routes/Layouts/Startup.tsx` (fallback title), `client/vite.config.ts` (manifest `name`, `short_name`, `start_url: '/'`); root `index.html` is a standalone copy with the AYANA title |
| Assets | `client/public/assets/`: new favicons/logo/maskable icons, `agent-ayana.png` (endpoint icon), and provider icons (`deepseek`, `grok`, `llama`, `mistral`, `perplexity`, `qwen`, `google`, `search-engine`) |
| Legacy file | `api/server/controllers/ErrorController.js`: old Mongo validation/duplicate-key handler. **Unreferenced**; upstream imports `ErrorController` from `@librechat/api` |
| Lint noise | Removed several `eslint-disable` comments in client hooks/components, `packages/client`, and `api/server/routes/types/assistants.js`. Drift, not intentional; on conflicts take upstream's side |
| CI | Deleted most upstream `.github/workflows/*` and issue templates and all upstream-added workflows plus `.github/scripts`, `CODEOWNERS`, and `MAIN_PROMOTION.md`. On merge, resolve `modify/delete` conflicts as deleted and drop any newly added upstream CI files. Added `docker-build.yml`: on GitHub release, builds the root `Dockerfile` and pushes `ghcr.io/qdhayana/librechat:<tag>` and `:latest`. |
| Misc | Root `robots.txt` (`Disallow: /`, keeps the app out of search engines) |

## Deployment and Local Config (gitignored, not in the repo)

- `librechat.yaml`, `.env`, `docker-compose.override.yml`, `data/`, `logs/`, `uploads/`, and `client/public/images/` are local/server files. Read them for context, but do not commit them.
- **`librechat.yaml` contains plaintext secrets** (MCP `Authorization` headers and an API key). Never copy values from it into committed files, docs, PRs, or logs. Prefer `${ENV_VAR}` references.
- `librechat.yaml` highlights:
  - Auth: `registration.socialLogins: ['openid']`.
  - Custom endpoints: `AYANA AI (Bali)`, `AYANA AI (Komodo)`, `AYANA AI (AYANA Rewards)` (all served from `https://ayana-ai.ayana.com/api/`, `iconURL: /assets/agent-ayana.png`, `fetch: false`, guest/`is_ops` params via `addParams.options`), plus an `Other models` endpoint through OpenRouter.
  - MCP servers: `browser-tab`, `knowledge-engine`, `rewards-middleware`, `perplexity-ask`, `fetch`, `pdf-reader`.
  - Also configures STT/TTS, Mistral OCR, Serper + Cohere web search, memory, and `filteredTools`.
- Production runs from `deploy-compose.yml` (upstream base) layered with `docker-compose.override.yml` (AYANA: mounts `.env`, `librechat.yaml`, `/home/ubuntu/public`, uses a locally built `ayanagpt:<hash>` image, drops the bundled MongoDB in favour of `MONGO_URI`, exposes `3080` and the `8080` browser-tab WebSocket).
- Branding is also driven at runtime by env vars (`APP_TITLE`, `HELP_AND_FAQ_URL`, ...), so check `.env` before changing code.

## Working Rules for This Fork

- Before touching an upstream file, ask whether the same result is achievable via `librechat.yaml`/`.env`. If code is needed, keep the edit small and localized, and add it to the table below.
- New AYANA-only backend logic still follows the workspace rules above: TypeScript in `/packages/api`, with a thin wrapper in `/api` only if unavoidable.
- When opening a PR, run `/review` and `/security-review` on the changes (organization requirement).
- After syncing upstream, run `npm run smart-reinstall` and confirm `git diff main ayana --stat` still shows only the intended delta.
