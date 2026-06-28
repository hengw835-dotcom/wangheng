# Codex Merge Acceptance

Date: 2026-06-28

## Scope

The merge completed stages 01-06 for the existing target project. The reference frontend was used as a design and interaction reference only; existing routes, auth, permissions, backend contracts, and build system were preserved.

## Accepted Areas

| Area | Result | Evidence |
|---|---|---|
| Build system | Accepted | Frontend uses existing Vite 4 build through `frontend/scripts/build-win.ps1`; no dependency install was performed. |
| API layer | Accepted | Pages migrated to `frontend/src/services/api.js` adapters and shared DTO helpers. |
| Authentication | Accepted | Login does not attach stale bearer tokens to `/auth/token`; token storage remains `smart-harvester-token`. |
| Permissions | Accepted | Route/action permissions match backend roles; destructive sensor delete is ADMIN-only. |
| Dashboard | Accepted | Dashboard uses store/model data and reusable components, with loading/error/offline states. |
| Machines and tasks | Accepted | CRUD/status/progress pages use real DTOs, validation, pagination, race guards, and duplicate-submit protection. |
| Control/MQTT | Accepted with limitation | Commands route through backend EMQX audit API with `Idempotency-Key`; no browser MQTT credentials introduced. STOMP/SockJS dependency was not added. |
| AI and sensors | Accepted with limitation | AI upload validates MIME/size and renders backend pixel boxes. Sensor pagination/sorting/report aggregation are explicit frontend adapters because backend endpoints do not yet provide paging/statistics. |
| Production mock safety | Accepted | `VITE_API_MODE=mock` is blocked in production by runtime config tests. |
| Debug logging | Accepted | `console.log` and `debugger` were removed from `frontend/src` and backend Java sources. |

## Verification Results

| Command | Result |
|---|---|
| `node --test src/**/*.test.js` from `frontend` | Passed, 31/31 tests. |
| `node --check` for changed frontend JS service/model files | Passed. |
| `powershell -File ./scripts/build-win.ps1` from `frontend` | Passed. Vite build succeeded. |
| `rg -n "console\\.log|debugger" frontend/src backend/src/main/java` | Passed, no matches; command exits 1 because ripgrep returns 1 when there are no matches. |
| `where.exe mvn; .\mvnw.cmd test` fallback check | Not run. `mvn` and Maven wrapper are not available in this environment; Java 17 is available. |

## Remaining Risks

| Risk | Impact | Recommended Follow-up |
|---|---|---|
| Backend lacks sensor pagination/sorting/statistics APIs | Frontend handles those client-side for now; large datasets may be slow. | Add backend pageable endpoints and report summary APIs. |
| Backend AI endpoint does not enforce upload size/MIME in controller | Frontend blocks common invalid uploads, but backend should still enforce limits. | Add backend multipart validation and tests. |
| WebSocket frontend integration has no STOMP/SockJS client dependency | Realtime event push is not fully wired to backend `/ws`. | Approve and add a compatible STOMP/SockJS client, or expose native WebSocket endpoint. |
| Vite build reports large Element Plus/ECharts chunks | First-load payload can be improved. | Split more page-level chunks and consider selective Element Plus imports. |
| Backend tests were not executed locally | Backend regression confidence is lower than frontend. | Run `mvn test` in an environment with Maven or add Maven wrapper. |

## Rollback

Use the per-stage commits to rollback incrementally:

- Stage 03: `5a76062`
- Stage 04: `f2cb282`
- Stage 05: `4f31f72`

After final hardening is committed, rollback with `git revert <commit>` for the stage that needs to be undone.

## Final Acceptance Checklist

- [x] Frontend tests pass.
- [x] Frontend production build passes.
- [x] No new dependencies installed.
- [x] No production mock fallback introduced.
- [x] Business routes and auth model preserved.
- [x] Sensitive credentials remain environment-driven.
- [x] Known limitations documented.
