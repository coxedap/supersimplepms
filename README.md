# PMS 0.1 — Execution OS

An opinionated **Productivity Management System** built for teams of 10–30 people. Not a generic task manager — an execution system focused on throughput, clarity, and accountability.

---

## Features

### Focus Dashboard (My Workspace)
- Real-time execution status: today's tasks, at-risk deadlines, overdue & blocked items
- WIP (Work In Progress) visualizer with pressure indicator
- Weekly performance metrics (completion rate, on-time %, cycle time)
- Personal Kanban board with drag-and-drop status transitions

### Team Health Dashboard (Managers & Admins)
- Task distribution breakdown by status (Todo, Doing, Blocked, Done, Overdue)
- Overload detection — flags users exceeding WIP limits
- Project health & risk scoring (0–100 scale based on at-risk/overdue tasks)
- Team-wide execution board with project filtering

### Execution Rules
- **WIP Limits**: Configurable per-org defaults (default: 3 active tasks, 1 P1 task) with per-user overrides
- **Enforced Transitions**: Must provide a blocker reason to move a task to BLOCKED
- **Deadline Monitoring**: Automatic overdue detection and risk-level badges (LOW, AT_RISK, CRITICAL)
- **Role-Based Access**: CONTRIBUTOR, TEAM_LEAD, MANAGER, ADMIN — each with scoped permissions

### Multi-Tenancy & Invites
- Organization-scoped data isolation
- Token-based email invite flow (7-day expiry)
- First registration creates the organization + admin account

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5, TailwindCSS 3 |
| State | Zustand (UI), TanStack React Query (server) |
| Backend | Node.js 20+, Express 4, TypeScript 5 |
| Database | PostgreSQL 16, Prisma 5 ORM |
| Auth | JWT (httpOnly cookies), bcrypt |
| Email | Nodemailer (Mailhog dev / Resend production) |
| Infra | Docker Compose, Railway (backend), Vercel (frontend) |

---

## Architecture

**Modular Monolith** with Clean Architecture layers per module:

```
backend/src/modules/
├── user/           # Auth, invites, role management
├── task/           # CRUD, status transitions, WIP enforcement
├── project/        # Project management, team assignment
├── team/           # Team creation, membership
├── dashboard/      # Focus & Team Health dashboards
├── metrics/        # Weekly performance calculations
└── system/         # Org-level configuration
```

Each module follows: **Domain** (entities) → **Application** (services) → **Infrastructure** (repositories) → **Controller** (HTTP)

```
frontend/src/
├── features/       # Feature modules (tasks, users, dashboard, teams, projects, metrics)
├── components/     # Shared components (Layout, Modal, Toast)
├── store/          # Zustand stores (auth, toast)
└── lib/            # Axios API client
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 1. Start Infrastructure

```bash
docker-compose up -d    # PostgreSQL + Mailhog
```

This starts:
- **PostgreSQL** on port `5432` (user: `postgres`, password: `postgres`, db: `execution_os`)
- **Mailhog** on port `1025` (SMTP) and `8025` (web UI for viewing emails)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env          # Create env file (defaults work with Docker)
npx prisma generate
npx prisma migrate dev
npm run seed                  # Optional: seed demo data
npm run dev                   # Starts on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                   # Starts on http://localhost:3000
```

### 4. Verify

- Open http://localhost:3000 — you should see the login page
- Open http://localhost:8025 — Mailhog UI (view invite emails)

---

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/execution_os` |
| `PORT` | Server port | `4000` |
| `JWT_SECRET` | Token signing secret | `dev-secret` |
| `SMTP_HOST` | SMTP server (empty = console logging) | `localhost` |
| `SMTP_PORT` | SMTP port | `1025` |
| `SMTP_USER` | SMTP username (empty for Mailhog) | — |
| `SMTP_PASS` | SMTP password | — |
| `SMTP_FROM` | Sender email address | `noreply@pms.local` |
| `APP_URL` | Frontend URL (for invite links) | `http://localhost:3000` |
| `FRONTEND_URL` | CORS origin | `http://localhost:3000` |

See [.env.production.example](.env.production.example) for production setup (Supabase + Resend + Railway).

---

## API Routes

### Public
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create organization + first admin |
| POST | `/api/auth/login` | Login (sets JWT cookie) |
| POST | `/api/auth/logout` | Clear auth cookie |
| POST | `/api/auth/invite/accept` | Accept invite + create account |

### Authenticated
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/users` | All | List org users |
| POST | `/api/users/invite` | ADMIN, MANAGER | Send email invite |
| PATCH | `/api/users/:id/role` | ADMIN | Change user role |
| PATCH | `/api/users/:id/team` | MANAGER+ | Assign user to team |
| PATCH | `/api/users/:id/limits` | ADMIN, MANAGER | Set WIP/P1 overrides |
| PATCH | `/api/users/:id/status` | ADMIN | Deactivate user |
| POST | `/api/tasks` | ADMIN, MANAGER, TEAM_LEAD | Create task |
| PUT | `/api/tasks/:id` | All | Update task |
| PATCH | `/api/tasks/:id/status` | All | Change task status |
| GET | `/api/tasks/owner/:ownerId` | All | Get user's tasks |
| DELETE | `/api/tasks/:id` | ADMIN, MANAGER | Delete task |
| GET | `/api/dashboard/focus/:userId` | All | Personal dashboard data |
| GET | `/api/dashboard/team` | All | Team health data |
| POST | `/api/projects` | MANAGER+ | Create project |
| GET | `/api/projects` | All | List projects |
| PUT | `/api/projects/:id` | MANAGER+ | Update project |
| POST | `/api/teams` | ADMIN, MANAGER | Create team |
| GET | `/api/teams` | All | List teams |
| PATCH | `/api/teams/:id` | ADMIN, MANAGER | Update team |
| POST | `/api/teams/members` | ADMIN, MANAGER, TEAM_LEAD | Add team member |
| DELETE | `/api/teams/:teamId/members/:userId` | ADMIN, MANAGER | Remove member |
| GET | `/api/metrics/weekly/:userId` | All | Weekly performance metrics |

---

## Roles & Permissions

| Action | CONTRIBUTOR | TEAM_LEAD | MANAGER | ADMIN |
|--------|:-----------:|:---------:|:-------:|:-----:|
| View own dashboard | Y | Y | Y | Y |
| Update own tasks | Y | Y | Y | Y |
| Create tasks | — | Y | Y | Y |
| View Team Health | — | — | Y | Y |
| Manage teams | — | own team | Y | Y |
| Invite members | — | — | Y | Y |
| Change roles | — | — | — | Y |
| Set WIP limits | — | — | Y | Y |
| Deactivate users | — | — | — | Y |

---

## Deployment

**Backend** — Railway (recommended):
1. Connect your GitHub repo
2. Set root directory to `/`
3. Add environment variables from `.env.production.example`
4. Railway auto-detects the build/start scripts from `package.json`

**Frontend** — Vercel (recommended):
1. Connect your GitHub repo
2. Set root directory to `frontend`
3. Set `VITE_API_URL` to your Railway backend URL
4. Deploy

**Database** — Supabase:
1. Create a new project
2. Copy the connection string to `DATABASE_URL`

---

## Product Principles

- **Opinionated Workflow** — enforces execution discipline, not a passive list
- **No Feature Bloat** — minimalist UI, only essential execution data
- **Low Cognitive Load** — Focus Dashboard tells you what to do *now*
- **Designed to Evolve** — modular monolith, easy to split into microservices
