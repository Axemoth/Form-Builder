# ⚓ AxeForm - Premium Monorepo Form Builder

AxeForm is an enterprise-grade, full-stack, database-backed form builder structured as a highly scalable pnpm/Turborepo monorepo. It integrates a Next.js frontend, an Express/tRPC backend, Drizzle ORM, PostgreSQL, Google OAuth, credentials authentication, dynamic visual response collection, deep analytics charts, and responsive themed notification dispatches.

---

## 🔑 Live Demo & Evaluation Credentials

You can interact with the live deployed production site immediately using the pre-configured credentials below:

> [!IMPORTANT]
> **Production URL**: [https://axeform.axemoth.com](https://axeform.axemoth.com)
> * **Email Address**: `chaiforms@gmail.com`
> * **Default Password**: `password123`

---

## 🚀 Recent Enterprise Engineering Enhancements

The monorepo has been heavily optimized and secured with four enterprise-grade projects successfully verified and integrated:

### 1. 🛡️ Hardened Dynamic Zod Validation Engine & Performance Optimizations
*   **Database $N+1$ Query Fixes**: Added batch option loading inside `getFormBySlug` and `submitFormResponse` using Drizzle's `inArray()`, replacing looping database operations with highly efficient in-memory $O(N)$ lookup maps.
*   **ReDoS Complexity Shield**: Built custom regex complexity checks (`isSafeRegex`) to block nested quantifiers and excessive rules, preventing catastrophic backtracking vulnerabilities. Added a 5,000-character input ceiling.
*   **Timezone & Date Integrity**: Enforced absolute `YYYY-MM-DD` ISO-compliant validation schemas on submissions.
*   **Cycle Dependency Engine**: Created a custom **Depth-First Search (DFS)** cycle detection check in `saveFormFields` to intercept and reject conditional validation loops before they can cause infinite cycles in the UI.

### 2. 📧 End-to-End Credentials Email Verification Service
*   **Database Extensions**: Built the `emailVerifications` database relations to safely map secure random crypto tokens to user UUIDs with customizable expirations.
*   **Mailer Carrier**: Built `sendVerificationEmail` with clean HTML templates and a built-in sandbox logging fallback for offline inspection.
*   **Verification Gates**: Created backend verify-email/resend mutations and built a beautiful glassmorphic dashboard notification banner to prompt unverified users.

### 3. 🔒 Hybrid Email Verification Guard (Operational Gatekeeping)
*   **Publish Protection**: Intercepts `updateForm` status transitions to block unverified users from transitioning draft forms to `"published"` status.
*   **Collection Shielding**: Intercepts `submitFormResponse` submissions to reject dynamic response collection if the form owner has not verified their email address.

### 4. 🧭 Dynamic Notifications Popover (Den Den Mushi logs)
*   **Real-time Submissions stream**: Added a `getRecentNotifications` query to fetch recent response logs, polling automatically in the background every **15 seconds** to provide live telemetry updates!
*   **Radix UI Dropdown Popover**: Replaced the static notification bell with a gorgeous dropdown popover featuring relative time logs (`just now`, `5m ago`, etc.) and unread badge state tracking.
*   **Aesthetic Cleanup**: Removed the non-functional static search bar from the main navbar to optimize visual space and focus on core actions.

---

## Quick Project Summary

- Monorepo: pnpm workspaces + Turborepo
- Frontend: `apps/web`, Next.js 16 App Router, React 19, Tailwind CSS v4, Radix UI primitives, React Query, tRPC React
- Backend API: `apps/api`, Express, tRPC Express adapter, OpenAPI bridge, Scalar API docs
- Database: `packages/database`, Drizzle ORM, PostgreSQL, Drizzle migrations
- API contract: `packages/trpc`, shared tRPC router and typed client exports
- Services: `packages/services`, authentication and Google OAuth integration
- Logging: `packages/logger`, Winston logger
- Core domain: users, sessions, forms, fields, field options, responses, analytics, themes, notifications, email logs, admin operations

## Repository Layout

```txt
.
|-- apps/
|   |-- api/                 # Express HTTP server exposing /trpc, /api, /docs, /openapi.json
|   `-- web/                 # Next.js frontend application
|-- packages/
|   |-- database/            # Drizzle schema, migrations, db client, DB env validation
|   |-- eslint-config/       # Shared lint config package
|   |-- logger/              # Shared Winston logger
|   |-- services/            # Auth/user services and Google OAuth client
|   |-- trpc/                # tRPC server routers and typed client exports
|   `-- typescript-config/   # Shared TypeScript config presets
|-- docker-compose.yml       # Local PostgreSQL service
|-- package.json             # Root scripts for dev/build/db/lint/typecheck
|-- pnpm-workspace.yaml      # Workspace package discovery
`-- turbo.json               # Turborepo task graph
```

## High-Level Architecture

```mermaid
flowchart LR
  Browser["Browser / User"] --> Web["apps/web Next.js app"]
  Web --> TRPCClient["tRPC React client"]
  TRPCClient --> API["apps/api Express server"]
  API --> TRPCRouter["packages/trpc serverRouter"]
  TRPCRouter --> DB["packages/database Drizzle client"]
  TRPCRouter --> Services["packages/services auth/OAuth"]
  TRPCRouter --> Email["packages/trpc email service"]
  DB --> Postgres["PostgreSQL"]
```

The frontend calls typed tRPC procedures through `apps/web/trpc/create-client.ts`. Browser requests attach the local auth token from `localStorage` as a `Bearer` token. The Express server creates request context in `packages/trpc/server/context.ts`, then protected procedures validate the session token against the `sessions` table before allowing access.

## Main User Workflows

### 1. Authentication

Implemented across:

- `apps/web/app/login/page.tsx`
- `packages/trpc/server/routes/auth/route.ts`
- `packages/services/user/index.ts`
- `packages/database/schema.ts`

Supported flows:

- Credential signup
- Credential login
- Google OAuth login when Google env vars are configured
- Session creation and bearer-token authentication

Credential signup hashes user passwords with `bcryptjs` in `packages/services/user/index.ts`. Sessions are stored in the `sessions` table with an expiration timestamp. The first created user is promoted to `admin`; later users default to `user`.

Google login uses `google-auth-library`, fetches the Google profile, links by `googleId` or email, and creates a session just like credential login.

### 2. Form Creation

Implemented across:

- `apps/web/app/dashboard/page.tsx`
- `apps/web/components/dashboard/create-form-dialog.tsx`
- `packages/trpc/server/routes/form/route.ts`
- `packages/database/schema.ts`

Workflow:

1. Authenticated user opens the dashboard.
2. Dashboard queries `form.getUserForms`.
3. User creates a form with title, optional description, and optional theme.
4. `form.createForm` generates a slug from the title plus random bytes.
5. Form is inserted as `draft`, `public`, and owned by the current user.
6. User is redirected into the form workspace/editor.

Important implementation details:

- Forms belong to users via `forms.userId`.
- Slugs are unique.
- Draft forms are not publicly submittable.
- Forms can be archived without being deleted.

### 3. Form Builder / Field Editing

Implemented across:

- `apps/web/app/dashboard/forms/[formId]/edit/page.tsx`
- `apps/web/components/form-builder/field-list.tsx`
- `apps/web/components/form-builder/field-editor.tsx`
- `apps/web/components/form-builder/form-preview.tsx`
- `packages/trpc/server/routes/form/route.ts`

Workflow:

1. Editor loads form metadata and fields with `form.getFormById`.
2. User edits title, description, visibility, and fields.
3. Field changes are kept in local React state.
4. Save calls `form.updateForm` for metadata and `form.saveFormFields` for fields.
5. `saveFormFields` syncs the field list in a transaction:
   - Deletes fields removed from the editor.
   - Updates existing fields by ID.
   - Inserts new fields.
   - Rebuilds select options for select fields.

Supported field types:

- `short_text`
- `long_text`
- `email`
- `number`
- `single_select`
- `multi_select`
- `checkbox`
- `rating`
- `date`

Field config validation is enforced in the form router before saving. Select fields must provide options, non-select fields cannot provide options, option values must be unique, and validation config only accepts known constraint keys.

Supported validation config:

```ts
{
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  logic?: {
    fieldId: string;
    value: string | number | boolean;
  };
}
```

### 4. Publishing, Settings, and Access Control

Implemented across:

- `apps/web/app/dashboard/forms/[formId]/settings/page.tsx`
- `packages/trpc/server/routes/form/route.ts`

Form settings include:

- Title and description
- Slug
- Status: `draft`, `published`, `unpublished`
- Visibility: `public`, `unlisted`
- Submit button text
- Success message
- Redirect URL
- Required respondent email
- Multiple-response toggle
- Password protection
- Response limit
- Expiration date
- Theme name
- Multi-page mode

Password-protected public forms use `forms.passwordHash`. New form passwords are hashed with `bcryptjs` in `packages/trpc/server/routes/form/route.ts`. Verification supports bcrypt hashes and legacy SHA-256 hashes so older protected forms remain usable.

### 5. Public Form Rendering

Implemented across:

- `apps/web/app/f/[slug]/page.tsx`
- `apps/web/components/form-renderer/form-renderer.tsx`
- `apps/web/components/form-renderer/password-gate.tsx`
- `apps/web/components/form-renderer/themed-inputs.tsx`
- `packages/trpc/server/routes/form/route.ts`

Workflow:

1. Public route `/f/[slug]` calls `form.getFormBySlug`.
2. Backend validates form existence, status, archive state, password state, expiration, and response limits.
3. If password protected, the UI renders `PasswordGate`.
4. If unlocked, the backend returns dynamic field schema and options.
5. `FormRenderer` builds a runtime Zod schema for client-side validation.
6. Conditional logic hides or shows fields based on configured `validations.logic`.
7. Submission calls `form.submitFormResponse`.

Public form state handling:

- Missing form: error state
- Draft form: blocked outside preview
- Archived form: blocked
- Expired form: blocked
- Response limit reached: blocked
- Password protected: locked until password verifies

### 6. Submission Validation and Storage

Implemented in:

- `packages/trpc/server/routes/form/route.ts`
- `packages/database/schema.ts`

Submission flow:

1. `submitFormResponse` receives `formId`, optional `respondentEmail`, optional `emailMeCopy`, answers, and metadata.
2. Backend fetches the form and rejects invalid states.
3. Backend fetches fields for the form.
4. Each answer is validated against field type and field validation config.
5. Hidden conditional fields are skipped.
6. Required fields are enforced.
7. Select answers are checked against stored `field_options`.
8. Valid response is inserted into `responses`.
9. Answers are inserted into `response_answers`.
10. Metadata is inserted into `response_metadata`.
11. Daily analytics are incremented.
12. Email notifications are sent or written to the local sandbox.

The backend is the final authority. Client-side validation improves UX, but the server validates submissions again before writing to the database.

### 7. Responses, CSV Export, and Analytics

Implemented across:

- `apps/web/app/dashboard/forms/[formId]/responses/page.tsx`
- `apps/web/app/dashboard/forms/[formId]/analytics/page.tsx`
- `packages/trpc/server/routes/form/route.ts`

Response features:

- View responses for forms owned by the current user.
- Export responses to CSV.
- Track views and submissions.
- Calculate conversion rate.
- Track average completion time when metadata is present.

Analytics data lives primarily in:

- `form_views`
- `form_analytics`
- `responses`
- `response_metadata`

### 8. Explore and Sharing

Implemented across:

- `apps/web/app/explore/page.tsx`
- `packages/trpc/server/routes/form/route.ts`

Explore uses `form.getPublicExploreForms`, which returns only published, public forms. Unlisted forms are excluded from explore but still accessible by direct slug.

QR sharing uses `form.getFormQrCode`, currently producing an external QR code URL for a form slug.

### 9. Email Notifications and Local Email Sandbox

Implemented in:

- `packages/trpc/server/services/email.ts`
- `packages/trpc/server/routes/form/route.ts`

Email settings are managed through:

- `form.saveEmailNotificationSettings`
- `form.getEmailNotificationSettings`

Notification types:

- Creator notification when a form receives a response.
- Respondent confirmation when the respondent requests or qualifies for a copy.

SMTP env vars:

```ini
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="AxeForm <noreply@axeform.com>"
```

If SMTP is not configured, the email service falls back to local visual sandbox mode. It writes rendered HTML emails into a local temp folder so templates can be inspected without sending real email.

Themes currently handled by the email renderer:

- `wano`
- `stark`
- `batman`

### 10. Admin Workflow

Implemented across:

- `apps/web/app/dashboard/admin/page.tsx`
- `packages/trpc/server/routes/admin/route.ts`
- `packages/trpc/server/trpc.ts`

Admin procedures use `adminProcedure`, which first authenticates the user and then checks `ctx.user.role === "admin"`.

Admin capabilities:

- View platform stats.
- View users.
- Promote or demote users.
- View all forms.
- Update form status.
- Archive or unarchive forms.
- Delete forms.

Self-demotion is blocked to avoid locking out the only current admin.

## Database Model

The schema lives in `packages/database/schema.ts`.

Core tables:

- `users`: account identity, role, credential password hash, Google OAuth ID
- `sessions`: bearer-token sessions
- `plans`: plan definitions
- `user_subscriptions`: user plan state
- `api_keys`: future/optional API key support
- `form_themes`: system or user-created themes
- `forms`: form metadata and access controls
- `tags`: reusable tags
- `form_tags`: many-to-many form/tag mapping
- `form_collaborators`: form collaboration records
- `fields`: form field definitions
- `field_options`: relational options for select fields
- `responses`: submitted response records
- `response_answers`: per-field answers
- `response_metadata`: metadata for a response
- `form_analytics`: daily aggregate analytics
- `form_views`: view events
- `notifications`: in-app notification records
- `email_notifications`: per-form email notification settings
- `email_logs`: sent/failed email audit records

Enums:

- `form_status`: `draft`, `published`, `unpublished`
- `form_visibility`: `public`, `unlisted`
- `field_type`: all supported field types
- `plan_name`: `free`, `pro`, `enterprise`
- `subscription_status`: `active`, `cancelled`, `expired`
- `collaborator_role`: `viewer`, `editor`
- `notification_type`: `new_response`, `form_published`
- `email_log_type`: `creator_notification`, `respondent_confirmation`
- `email_log_status`: `sent`, `failed`

Migrations live in `packages/database/drizzle/` and should be committed when schema changes are intentional.

## API Surface

The root router is `packages/trpc/server/index.ts`.

Routers:

- `health`
- `auth`
- `form`
- `admin`

Important auth procedures:

- `auth.getSupportedAuthenticationProviders`
- `auth.loginWithGoogleCode`
- `auth.signup`
- `auth.login`

Important form procedures:

- `form.createForm`
- `form.updateForm`
- `form.saveFormFields`
- `form.getPublicExploreForms`
- `form.getFormBySlug`
- `form.verifyFormPassword`
- `form.submitFormResponse`
- `form.getFormResponses`
- `form.exportResponsesToCsv`
- `form.getFormAnalytics`
- `form.getFormQrCode`
- `form.getThemesAndTemplates`
- `form.saveEmailNotificationSettings`
- `form.getEmailNotificationSettings`
- `form.getFormById`
- `form.getUserForms`
- `form.archiveForm`
- `form.unarchiveForm`
- `form.cloneForm`

Important admin procedures:

- `admin.getAdminStats`
- `admin.getUsers`
- `admin.toggleUserRole`
- `admin.getForms`
- `admin.adminUpdateFormStatus`
- `admin.adminToggleArchiveForm`
- `admin.adminDeleteForm`

The Express app also exposes:

- `GET /`
- `GET /health`
- `GET /openapi.json`
- `GET /docs`
- `/api` for OpenAPI-compatible tRPC procedures
- `/trpc` for tRPC clients

## Frontend Routes

Important Next.js routes:

- `/`: themed landing page
- `/login`: credential and Google auth page
- `/auth/callback/google`: Google OAuth callback
- `/dashboard`: authenticated dashboard
- `/dashboard/admin`: admin panel
- `/dashboard/themes`: theme/template selection
- `/dashboard/forms/[formId]/edit`: builder workspace
- `/dashboard/forms/[formId]/settings`: form settings
- `/dashboard/forms/[formId]/responses`: response list
- `/dashboard/forms/[formId]/analytics`: analytics
- `/explore`: public form discovery
- `/f/[slug]`: public form renderer

## Environment Variables

Create a root `.env` for local development. The repo ignores `.env` files, so do not commit secrets.

```ini
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:6432/dev"

# API server
PORT=8000
NODE_ENV=development
BASE_URL="http://localhost:8000"
LOGGER_LEVEL=debug

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID="your-google-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-google-client-secret"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3000/auth/callback/google"

# Optional SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM="AxeForm <noreply@axeform.com>"
```

Notes:

- `packages/database/env.ts` requires `DATABASE_URL`.
- `apps/api/src/env.ts` accepts `PORT`, `NODE_ENV`, and `BASE_URL`.
- `apps/web/env.js` accepts `NEXT_PUBLIC_API_URL`.
- `packages/services/env.ts` currently requires all Google OAuth variables.
- `packages/logger/env.ts` accepts `NODE_ENV` and `LOGGER_LEVEL`.
- SMTP vars are read directly by the email service.

## Local Development

Install dependencies:

```sh
pnpm install
```

Start PostgreSQL:

```sh
docker compose up -d
```

Run migrations:

```sh
pnpm db:migrate
```

Start all apps/packages in development mode:

```sh
pnpm dev
```

Expected local services:

- Web app: `http://localhost:3000`
- API server: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- PostgreSQL: `localhost:6432`

## Common Commands

```sh
# Root
pnpm dev
pnpm build
pnpm lint
pnpm check-types
pnpm format

# Database
pnpm db:generate
pnpm db:migrate
pnpm db:studio

# Targeted examples
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web check-types
pnpm --filter @repo/trpc exec tsc --noEmit
pnpm --filter @repo/api dev
```

## Implementation Notes for AI Code Review

Use this section as a map when reviewing the codebase.

High-value files:

- `packages/database/schema.ts`: source of truth for persisted domain model
- `packages/trpc/server/routes/form/route.ts`: largest domain router; most business rules live here
- `packages/trpc/server/trpc.ts`: auth and admin middleware
- `packages/services/user/index.ts`: credential auth, Google auth, session creation
- `packages/trpc/server/services/email.ts`: SMTP/sandbox email rendering
- `apps/web/trpc/create-client.ts`: frontend tRPC link and bearer-token attachment
- `apps/web/components/form-renderer/form-renderer.tsx`: runtime form schema and submission UX
- `apps/web/app/dashboard/forms/[formId]/edit/page.tsx`: builder save workflow
- `apps/web/app/f/[slug]/page.tsx`: public form access states

Important review topics:

- Ensure public form access checks stay server-side, not only client-side.
- Ensure `protectedProcedure` is used for owner-only operations.
- Ensure `adminProcedure` is used for admin-only operations.
- Ensure form ownership checks happen before reading or mutating private form data.
- Ensure dynamic field configs are validated before being stored.
- Ensure `submitFormResponse` validates against database fields and field options.
- Ensure password hashes are never returned to public routes.
- Ensure user credential passwords use bcrypt.
- Ensure form passwords use bcrypt, with legacy verification only for old hashes.
- Ensure email template content does not blindly trust user-provided HTML.
- Ensure CSV export escapes values correctly.
- Ensure migrations match schema changes.
- Ensure env validation matches documented setup.

Known areas worth future hardening:

- `packages/trpc/server/routes/form/route.ts` is large and could be split into smaller routers/modules.
- Email template generation uses HTML strings and should be reviewed for escaping user-provided labels/answers.
- Some visible text and source comments contain mojibake from earlier encoding issues.
- Public response submission would benefit from rate limiting and anti-spam controls.
- Google OAuth env vars are required by `packages/services/env.ts`, even when Google auth is not wanted locally.

## Git Ignore Policy

The repo should track source code, configuration, database migrations, and documentation. It should ignore:

- Dependencies (`node_modules`)
- Local env files
- Build outputs
- Turborepo/Vercel caches
- Coverage
- Logs
- Local temp/sandbox output
- OS/editor noise

Do not ignore `packages/database/drizzle/`; migrations are part of the application state and should be reviewed with schema changes.
