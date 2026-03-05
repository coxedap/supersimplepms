# PMS 0.1 (Productivity Management System)

An internal web-based Productivity Optimization System, also known as **Execution OS**. This is NOT a generic task manager. It is an opinionated execution system focused on throughput, clarity, and accountability for teams of 10–30 people.

---

## 🚀 Key Features

### 👤 Focus Dashboard (Primary Landing Page)
* **Real-time Execution Status**: Track Today’s tasks, Overdue tasks, and Blocked tasks.
* **WIP (Work In Progress) Visualizer**: Monitor current workload against configurable limits.
* **Actionable Cards**: Quick status transitions and deadline risk indicators (`WATCH`, `AT RISK`, `CRITICAL`).

### 📊 Team Health Dashboard
* **Task Distribution**: Real-time breakdown of tasks by status (Todo, Doing, Blocked, Done, Overdue).
* **Overload Detection**: Automatically identify users who have reached or exceeded their WIP limits.
* **Project Health & Risk Scoring**: Automatic calculation of project risk levels based on task status distribution and overdue counts.
* **Team-Wide Board**: Unified view of all active team tasks with owner and project visibility.

### 📋 Task Management & System Rules
* **Opinionated Workflow**: Enforced status transitions (e.g., must provide a `blockerReason` to move a task to `BLOCKED`).
* **WIP & P1 Limits**: Configurable limits per user to prevent multitasking and ensure focus on high-priority execution.
* **Deadline Risk Monitoring**: Automated overdue status transitions and risk level badges.
* **Role-Based Access Control**: Different permissions for `CONTRIBUTOR`, `TEAM_LEAD`, `MANAGER`, and `ADMIN`.

---

## 🛠 Tech Stack

### Frontend
* **Core**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
* **Styling**: [TailwindCSS](https://tailwindcss.com/)
* **Server State**: [@tanstack/react-query](https://tanstack.com/query/latest)
* **Local UI State**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
* **API Client**: [Axios](https://axios-http.com/)

### Backend
* **Core**: [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Express](https://expressjs.com/)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/)
* **Architecture**: **Modular Monolith** with clear domain boundaries (Domain, Application, Infrastructure, Controller layers).

---

## 📂 Project Structure

```text
PMS_0.1/
├── backend/
│   ├── prisma/             # Schema & Seed data
│   ├── src/
│   │   ├── modules/        # Domain-specific modules (User, Task, Project, Team, Dashboard, Metrics, System)
│   │   │   ├── [module]/
│   │   │   │   ├── domain/         # Entities & Types
│   │   │   │   ├── application/    # Services & Logic
│   │   │   │   ├── infrastructure/ # Repositories & DB access
│   │   │   │   └── controller/     # HTTP adapters
│   │   ├── shared/         # Shared utilities and error classes
│   │   ├── app.ts          # Express setup
│   │   └── server.ts       # Entry point
├── frontend/
│   ├── src/
│   │   ├── features/       # Feature-based folder structure
│   │   │   ├── tasks/
│   │   │   ├── users/
│   │   │   ├── dashboard/
│   │   ├── components/     # Global reusable components
│   │   ├── hooks/          # Global hooks
│   │   ├── lib/            # External library configurations (Axios, etc.)
│   │   └── store/          # Global state (Zustand)
└── docker-compose.yml      # PostgreSQL setup
```

---

## ⚙️ Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Docker](https://www.docker.com/) (for PostgreSQL)

### 2. Database Setup
Spin up the PostgreSQL database:
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
# Create .env and update DATABASE_URL if necessary
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 Product Principles
* **Opinionated Workflow**: The system enforces execution discipline rather than being a passive list.
* **No Feature Bloat**: Minimalist UI focused on essential execution data.
* **Designed to Evolve**: Built as a modular monolith to allow easy transition to microservices if needed.
* **Low Cognitive Load**: Focus Dashboard designed to tell a user exactly what they need to do *now*.
