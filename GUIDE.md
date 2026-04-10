# PMS 0.1 — Manager's Guide

A step-by-step guide for managers and admins to set up and use the Productivity Management System.

---

## Table of Contents

1. [First-Time Setup](#1-first-time-setup)
2. [Inviting Your Team](#2-inviting-your-team)
3. [Setting Up Teams](#3-setting-up-teams)
4. [Creating Projects](#4-creating-projects)
5. [Assigning Tasks](#5-assigning-tasks)
6. [Using Team Health Dashboard](#6-using-team-health-dashboard)
7. [Managing WIP Limits](#7-managing-wip-limits)
8. [Understanding Risk Levels](#8-understanding-risk-levels)
9. [User Roles Explained](#9-user-roles-explained)
10. [Day-to-Day Workflow](#10-day-to-day-workflow)

---

## 1. First-Time Setup

### Register Your Organization

1. Go to your PMS URL
2. Click **Register**
3. Fill in:
   - **Organization Name** — your company or department name
   - **Your Name** — displayed across the app
   - **Email** — used for login
   - **Password** — minimum 6 characters
4. Click **Register**

You are now the first **Admin** of your organization. All data is scoped to your organization — no one outside can see it.

---

## 2. Inviting Your Team

### Send an Invite

1. Go to **Users Management** in the sidebar
2. Click **Invite Member** (top right)
3. Enter:
   - **Email** — the person's work email
   - **Role** — choose their role (see [Roles](#9-user-roles-explained))
4. Click **Send Invite**

The person receives an email with a link. They click it, set their name and password, and they're in your organization.

> **Note:** Invites expire after 7 days. If someone misses it, you can send a new one.

### What Each Person Sees After Joining

| Role | Lands on | Can see |
|------|----------|---------|
| **Admin** | Team Health | Everything |
| **Manager** | Team Health | Team Health, My Workspace, Teams, Projects, Users |
| **Team Lead** | My Workspace | My Workspace, Teams, Projects |
| **Contributor** | My Workspace | My Workspace only |

---

## 3. Setting Up Teams

### Create a Team

1. Go to **Teams** in the sidebar
2. Click **Create Team**
3. Fill in:
   - **Team Name** — e.g., "Engineering", "Design", "Marketing"
   - **Team Leader** — pick from your org members (they must have TEAM_LEAD or higher role)
4. Click **Create**

The team leader is automatically added as a member.

### Add Members to a Team

1. In the Teams page, find your team
2. Click **Manage**
3. Use the **Add Member** dropdown to select users
4. They are now part of the team

> **Tip:** A user can only be in one team at a time. Assigning them to a new team removes them from the old one.

---

## 4. Creating Projects

### Create a Project

1. Go to **Projects** in the sidebar
2. Click **Create Project**
3. Fill in:
   - **Project Name** — e.g., "Website Redesign", "Q2 Campaign"
   - **Description** — brief summary
   - **Project Manager** — who oversees this project
   - **Team** (optional) — assign to a specific team
4. Click **Create**

Projects group tasks together. You'll see project health scores in the Team Health dashboard.

---

## 5. Assigning Tasks

### Create a Task

1. From **Team Health** dashboard, click **+ New Task** in the execution board section
2. Fill in:
   - **Title** — clear, actionable (e.g., "Design login page mockups")
   - **Owner** — who will do this task
   - **Project** — which project this belongs to
   - **Priority** — P1 (urgent), P2 (important), P3 (normal)
   - **Deadline** — when it must be done
   - **Estimated Effort** — hours estimate (optional)
3. Click **Create**

The task appears in the **TODO** column. The assigned person sees it in their My Workspace.

### Task Statuses

| Status | Meaning |
|--------|---------|
| **TODO** | Not started yet |
| **DOING** | Actively being worked on (counts against WIP limit) |
| **BLOCKED** | Cannot proceed — requires a reason |
| **OVERDUE** | Deadline has passed |
| **DONE** | Completed |

### How Tasks Move

```
TODO → DOING → DONE
              ↘ BLOCKED → DOING (when unblocked)
```

- Moving to **DOING**: the system checks WIP limits — if the person is already at capacity, it blocks the transition
- Moving to **BLOCKED**: a popup asks for the blocker reason (required)
- Moving to **DONE**: records completion time for metrics

> **Important:** Tasks can be dragged between columns on both the personal and team boards.

---

## 6. Using Team Health Dashboard

The Team Health dashboard is your command center. It has four sections:

### Task Distribution
A quick count of all tasks by status. Use this to spot bottlenecks at a glance:
- Too many in DOING? Your team is overloaded
- Too many BLOCKED? Investigate the blockers
- Growing OVERDUE count? Deadlines need attention

### Overload Alerts
Lists team members who have **reached or exceeded** their WIP limit. These people cannot take on new DOING tasks until they finish something.

### Project Health
Each project gets a risk score (0–100):
- **Healthy** (green): Score below 30 — on track
- **Medium Risk** (yellow): Score 30–60 — some at-risk tasks
- **High Risk** (red): Score above 60 — multiple overdue/at-risk tasks

The progress bar shows the ratio of DONE vs. active vs. blocked tasks.

### Team Execution Board
A Kanban board showing **all** tasks across the organization. You can:
- **Filter by project** using the dropdown
- **Drag tasks** between columns to update their status
- **Click + New Task** to assign work directly
- See who owns each task and which project it belongs to

---

## 7. Managing WIP Limits

WIP (Work In Progress) limits prevent multitasking and keep your team focused.

### Default Limits
- **WIP Limit**: 3 active tasks (DOING status) per person
- **P1 Limit**: 1 urgent task per person

### Override for Specific Users

1. Go to **Users Management**
2. Click on a user's name
3. Adjust:
   - **WIP Limit Override** — set a custom active task limit
   - **P1 Limit Override** — set a custom urgent task limit
4. Save

### Why This Matters

When someone tries to start a 4th task (with a limit of 3), the system blocks it. This forces them to finish or hand off existing work first. It's not a restriction — it's a focus tool.

---

## 8. Understanding Risk Levels

### Task Risk Levels

| Level | Condition | What to Do |
|-------|-----------|-----------|
| **LOW** | Deadline > 48 hours away | No action needed |
| **AT RISK** | Deadline within 24–48 hours | Check progress with the owner |
| **CRITICAL** | Deadline < 24 hours or already overdue | Intervene immediately |

### Project Risk Scores

The system calculates risk per project:
- Each **CRITICAL** task adds 20 points
- Each **AT RISK** task adds 10 points
- Score 0–30 = Healthy, 30–60 = Medium Risk, 60+ = High Risk

---

## 9. User Roles Explained

| Role | Purpose | Key Permissions |
|------|---------|----------------|
| **Admin** | System owner | Everything — manage users, roles, limits, teams, projects, tasks |
| **Manager** | Team overseer | Create teams & projects, invite members, assign tasks, view team health |
| **Team Lead** | Day-to-day lead | Manage own team members, create & assign tasks |
| **Contributor** | Individual contributor | View and update own tasks only |

### Changing Roles

1. Go to **Users Management**
2. Click on a user
3. Change their **Role** dropdown
4. Save

> **Only Admins** can change roles. Be thoughtful — a Manager can invite people and create teams.

---

## 10. Day-to-Day Workflow

### Morning Routine (5 minutes)

1. Open **Team Health** dashboard
2. Check:
   - Any **overload alerts**? Someone needs help prioritizing
   - Any **blocked tasks**? Follow up on blockers
   - Any **overdue tasks**? Decide to extend deadline or reassign
3. Glance at **project health** — anything trending to red?

### During the Day

- When a team member reports a blocker → they move their task to BLOCKED with a reason → you see it in the dashboard
- When you need to assign new work → use **+ New Task** on the Team Health board
- When priorities shift → update task priorities (P1/P2/P3) and deadlines

### End of Week

- Review **weekly metrics** for each team member (accessible from their profile):
  - Tasks completed
  - On-time rate
  - Average cycle time
- Use this data for 1:1s and sprint retrospectives

### For Contributors

Contributors see **My Workspace** when they log in:
1. **Focus Dashboard** at the top shows exactly what needs attention
2. **Personal Board** below lets them drag tasks through the workflow
3. They cannot create tasks — work is assigned to them by leads and managers

---

## Quick Reference

| I want to... | Where to go |
|--------------|-------------|
| See team status | Team Health (sidebar) |
| Assign a new task | Team Health → + New Task |
| Invite someone | Users Management → Invite Member |
| Create a team | Teams → Create Team |
| Create a project | Projects → Create Project |
| Check someone's workload | Team Health → Overload section |
| Change someone's role | Users Management → click user → Role |
| Adjust WIP limits | Users Management → click user → Limits |
| Check my own tasks | My Workspace (sidebar) |
