# Enterprise Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a maintainable enterprise frontend foundation for configuration, HTTP access, and reusable request states.

**Architecture:** Move environment reads and HTTP behavior out of stores/views into focused modules. Keep existing Vue pages working while introducing reusable services that later page-splitting tasks can consume.

**Tech Stack:** Vue 3, Vite, Pinia, Axios, Element Plus, Node test runner.

## Global Constraints

- Keep changes scoped to `smart-harvester/frontend`.
- Do not redesign the UI in this slice.
- Preserve current login behavior and local storage keys.
- Build must pass with the existing Vite pipeline.

---

### Task 1: Runtime Config And Error Normalization

**Files:**
- Create: `frontend/src/config/runtime.js`
- Create: `frontend/src/services/error.js`
- Test: `frontend/src/services/error.test.js`

**Interfaces:**
- Produces: `getRuntimeConfig(env)`, `describeApiError(error)`

- [ ] Write tests for fallback API base URL and common HTTP error messages.
- [ ] Run `node --test src/services/error.test.js` and confirm it fails before implementation.
- [ ] Implement config and error helpers.
- [ ] Run the test and confirm it passes.

### Task 2: HTTP Client Module

**Files:**
- Create: `frontend/src/services/http.js`
- Modify: `frontend/src/store/index.js`

**Interfaces:**
- Produces: `apiClient`, `installHttpInterceptors(client)`
- Consumes: `describeApiError(error)`, `getRuntimeConfig(env)`

- [ ] Move Axios defaults and interceptors out of the Pinia store file.
- [ ] Keep 401 logout behavior except for login requests.
- [ ] Update stores to import `apiClient` and `describeApiError`.
- [ ] Verify login and API calls continue to use `/api`.

### Task 3: Shared Async State Surface

**Files:**
- Create: `frontend/src/components/common/RequestState.vue`

**Interfaces:**
- Produces: `<RequestState :loading :error :empty empty-text error-title />`

- [ ] Add a reusable loading/empty/error component.
- [ ] Use it in one low-risk management page as the adoption example.
- [ ] Verify the build catches template or import issues.

### Task 4: Verification

**Files:**
- Modify: `frontend/package.json`

- [ ] Add `test` script for Node tests.
- [ ] Run `npm run test`.
- [ ] Run `npm run build:linux`.
- [ ] Record any remaining gaps for the next phase.
