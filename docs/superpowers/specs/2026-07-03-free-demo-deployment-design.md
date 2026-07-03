# Free Demo Deployment Design

## Goal
Provide a zero-cost public demo deployment path for the Smart Harvester system without requiring the user to buy a server.

## Chosen Approach
Use GitHub as the source repository, GitHub Pages for the Vue/Vite frontend, and Render Free Web Service for the Spring Boot backend. The backend runs a `demo` Spring profile with H2 storage and demo capabilities enabled, avoiding paid MySQL, Redis, and EMQX services.

## Architecture
- Frontend is built by GitHub Actions from `frontend/` and published to GitHub Pages.
- Backend is deployed from `backend/Dockerfile` on Render using `SPRING_PROFILES_ACTIVE=demo`.
- Demo profile listens on `${PORT}` for Render compatibility and uses H2 file storage at `./data/smart_harvester_demo`.
- MQTT connection remains optional: if no broker is available, the existing MQTT client logs a warning and MQTT features degrade.
- Redis health checks are disabled in demo mode.

## Components
- `backend/src/main/resources/application-demo.yml`: demo runtime configuration.
- `backend/src/test/java/com/smartharvester/config/DemoProfileConfigTest.java`: verifies demo profile essentials.
- `.github/workflows/deploy-pages.yml`: builds and deploys frontend to GitHub Pages.
- `render.yaml`: optional Render Blueprint for backend.
- `FREE_DEPLOYMENT.md`: user-facing deployment checklist.

## Data Flow
Browser loads GitHub Pages static assets. API calls use `VITE_API_BASE_URL`, set during GitHub Actions build, to reach the Render backend. The backend serves REST/WebSocket endpoints and persists demo data through H2/Flyway.

## Error Handling
If Render free service sleeps, the first request may take about one minute to wake. If MQTT is unavailable, backend startup continues because the existing MQTT bean returns `null` after logging a warning. If `VITE_API_BASE_URL` is not configured, the frontend build still succeeds but API calls will target the GitHub Pages origin and fail; deployment docs call this out explicitly.

## Testing
- Run backend Maven tests.
- Run frontend Node tests/build when npm is available.
- Verify workflow and Render files are syntactically plain YAML.
