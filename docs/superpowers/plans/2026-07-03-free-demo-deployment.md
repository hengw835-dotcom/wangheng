# Free Demo Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a zero-cost deployment path using GitHub Pages for the frontend and Render Free for the backend demo API.

**Architecture:** The backend gets a dedicated Spring `demo` profile backed by H2 and Render's `${PORT}` variable. The frontend gets a GitHub Actions workflow that builds Vite static assets and publishes them to Pages with an API base URL supplied by GitHub repository variables or secrets.

**Tech Stack:** Spring Boot 3.2, Java 17, H2, Flyway, Vue 3, Vite, GitHub Actions, GitHub Pages, Render Docker Web Service.

## Global Constraints

- Do not require a paid server, paid database, paid Redis, or paid MQTT broker.
- Keep the existing Docker Compose production deployment intact.
- Do not commit real secrets or `.env.production`.
- Demo mode may use non-production defaults and seeded data.
- Production frontend must keep `VITE_API_MODE=real`.

---

### Task 1: Backend demo profile

**Files:**
- Create: `backend/src/test/java/com/smartharvester/config/DemoProfileConfigTest.java`
- Create: `backend/src/main/resources/application-demo.yml`

**Interfaces:**
- Consumes: Spring Boot profile configuration loading from `application-demo.yml`.
- Produces: A `demo` profile that sets `server.port=${PORT:8086}`, H2 datasource, demo capability modes, optional MQTT defaults, and disabled Redis health.

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/java/com/smartharvester/config/DemoProfileConfigTest.java` with assertions that `application-demo.yml` exists and contains Render/H2/demo essentials.

- [ ] **Step 2: Run test to verify it fails**

Run: `mvn -q -Dtest=DemoProfileConfigTest test`
Expected: FAIL because `application-demo.yml` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `backend/src/main/resources/application-demo.yml` with Render port, H2 datasource, JWT defaults, CORS env, demo capabilities, MQTT fallback, and disabled Redis health.

- [ ] **Step 4: Run test to verify it passes**

Run: `mvn -q -Dtest=DemoProfileConfigTest test`
Expected: PASS.

- [ ] **Step 5: Run backend suite**

Run: `mvn -q test`
Expected: PASS.

### Task 2: Free deployment descriptors

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `render.yaml`
- Create: `FREE_DEPLOYMENT.md`

**Interfaces:**
- Consumes: frontend `package-lock.json`, frontend `build:linux`, backend Dockerfile.
- Produces: GitHub Pages workflow, Render blueprint, and end-user deployment checklist.

- [ ] **Step 1: Add GitHub Pages workflow**

Create `.github/workflows/deploy-pages.yml` to install frontend dependencies, build with `npm run build:linux -- --base="/${{ github.event.repository.name }}/"`, and deploy `frontend/dist` to Pages.

- [ ] **Step 2: Add Render blueprint**

Create `render.yaml` with a Docker web service using `backend/Dockerfile`, `SPRING_PROFILES_ACTIVE=demo`, and demo environment variables.

- [ ] **Step 3: Add deployment guide**

Create `FREE_DEPLOYMENT.md` with exact GitHub and Render setup steps, including `VITE_API_BASE_URL` configuration after Render provides the backend URL.

- [ ] **Step 4: Verify files**

Run: `git diff --check`
Expected: no whitespace errors.

### Task 3: Commit and handoff

**Files:**
- Modify: git index only.

**Interfaces:**
- Produces: commit `feat: add free demo deployment path` on branch `feat/free-demo-deploy`.

- [ ] **Step 1: Review status**

Run: `git status --short`
Expected: only planned docs/config/test files are changed.

- [ ] **Step 2: Commit**

Run: `git add ... && git commit -m "feat: add free demo deployment path"`
Expected: commit succeeds.
