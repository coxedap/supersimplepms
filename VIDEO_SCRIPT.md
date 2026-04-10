# PMS 0.1 — Tutorial Video Script

**Target length:** 8–10 minutes
**Audience:** New users (managers and contributors)
**Tone:** Professional, clear, no fluff

---

## INTRO (0:00 – 0:30)

**[Screen: Login page]**

> "This is PMS 0.1 — our Execution OS. It's not a generic task manager. It's designed to keep our team focused, accountable, and unblocked."
>
> "In this walkthrough, I'll show you how to set up your organization, invite your team, create projects, assign tasks, and use the dashboards to stay on top of everything."

---

## SCENE 1: Registration (0:30 – 1:30)

**[Screen: Register page]**

> "Let's start from scratch. Click Register."

**[Action: Fill in Organization Name, Your Name, Email, Password → Click Register]**

> "This creates your organization and makes you the first Admin. Everything in PMS is scoped to your organization — your data is completely separate from anyone else's."

**[Screen: Redirects to Team Health dashboard (empty)]**

> "As an Admin, you land on the Team Health dashboard. It's empty because we haven't set anything up yet. Let's fix that."

---

## SCENE 2: Inviting Team Members (1:30 – 3:00)

**[Screen: Click "Users Management" in sidebar]**

> "First, let's bring in our team. Go to Users Management and click Invite Member."

**[Action: Click Invite Member → Modal opens]**

> "Enter their email and choose a role."

**[Action: Type email, select "CONTRIBUTOR" from dropdown → Click Send Invite]**

> "They'll receive an email with a link. Let me show you what that looks like."

**[Screen: Open Mailhog at localhost:8025 (for local demo) OR show email inbox]**

> "Here's the invite email. When they click the link..."

**[Screen: Accept Invite page]**

> "...they land on this page where they set their name and password. That's it — they're in."

**[Action: Fill in name and password → Click Join]**

> "Let's invite a couple more people — a Manager and a Team Lead."

**[Action: Quick montage of sending 2 more invites with different roles]**

> "Now let me explain the four roles quickly:"
>
> - "**Admin** — full control over everything"
> - "**Manager** — can create teams, projects, invite members, and sees Team Health"
> - "**Team Lead** — manages their own team and creates tasks"
> - "**Contributor** — focuses on their own tasks only"

---

## SCENE 3: Setting Up Teams (3:00 – 4:00)

**[Screen: Click "Teams" in sidebar → Click "Create Team"]**

> "Now let's organize people into teams. Click Teams, then Create Team."

**[Action: Type "Engineering" as team name → Select a Team Lead → Click Create]**

> "The team leader is automatically added as a member. Now let's add more people."

**[Action: Click Manage → Use dropdown to add 2 contributors]**

> "Each person can only be in one team. When you assign someone here, this becomes their team."

---

## SCENE 4: Creating Projects (4:00 – 4:45)

**[Screen: Click "Projects" in sidebar → Click "Create Project"]**

> "Projects group related tasks together. Let's create one."

**[Action: Fill in project name "Website Redesign", add description, select project manager, optionally assign to Engineering team → Click Create]**

> "You can assign a project to a team, or leave it unassigned if it's cross-functional. You'll see project health scores on the Team Health dashboard once tasks are added."

---

## SCENE 5: Creating & Assigning Tasks (4:45 – 6:15)

**[Screen: Go to Team Health dashboard → Scroll to execution board → Click "+ New Task"]**

> "This is where the real work starts. From Team Health, click New Task."

**[Action: Create Task modal opens → Fill in:]**
- Title: "Design homepage mockups"
- Owner: (select a contributor)
- Project: "Website Redesign"
- Priority: P2
- Deadline: (pick a date 3 days from now)

> "Set a clear title, assign an owner, pick the project and priority, and set a deadline. Click Create."

**[Screen: Task appears in TODO column]**

> "The task shows up in the TODO column. The assigned person sees it in their My Workspace."

**[Action: Create 2-3 more tasks quickly with different owners and priorities]**

> "Let me add a few more tasks so we can see the dashboards in action."

**[Action: Drag a task from TODO to DOING]**

> "To start working on a task, drag it to DOING. Notice the system checks the WIP limit — if this person already has 3 active tasks, it won't let you add another."

**[Action: Drag a task to BLOCKED]**

> "If a task is blocked, drag it here. You must enter a reason — this is intentional. We want visibility into what's stopping progress."

**[Screen: Block reason modal → Type "Waiting for API credentials from vendor" → Submit]**

> "Now everyone can see why this task is stuck."

---

## SCENE 6: Team Health Dashboard Deep Dive (6:15 – 7:30)

**[Screen: Team Health dashboard with data]**

> "Now that we have tasks, let's look at what the Team Health dashboard tells us."

**[Point to Task Distribution section]**

> "Task Distribution shows the count by status. If you see a lot of BLOCKED or OVERDUE, that's a signal to act."

**[Point to Overload section]**

> "Overload alerts flag anyone who's hit their WIP limit. These people can't take on more work until they finish something. This prevents multitasking."

**[Point to Project Health section]**

> "Project Health gives each project a risk score. Green means on track. Yellow means some tasks are at risk. Red means you need to intervene — multiple tasks are overdue or approaching deadline."

**[Point to execution board]**

> "The execution board at the bottom is your Kanban view of everything. Use the project filter dropdown to focus on one project at a time."

---

## SCENE 7: My Workspace — The Contributor View (7:30 – 8:30)

**[Action: Log out → Log in as a Contributor]**

> "Let's see what a Contributor experiences."

**[Screen: My Workspace loads]**

> "They land on My Workspace. No Team Health, no user management — just their work."

**[Point to Focus Dashboard]**

> "The Focus Dashboard at the top shows exactly what needs attention right now:"
> - "Tasks due today"
> - "At-risk deadlines"
> - "Overdue items"
> - "Blocked tasks"
> - "And the WIP meter — how close they are to their limit"

**[Point to Personal Board]**

> "Below that is their personal Kanban board. They can drag tasks between columns to update status. If they drag to BLOCKED, they enter a reason. If they drag to DONE, it records the completion time."

> "Contributors can't create tasks — work flows to them from Team Leads and Managers. This keeps the system clean and prevents scope creep."

---

## SCENE 8: WIP Limits in Action (8:30 – 9:00)

**[Screen: As contributor, try to drag a 4th task to DOING (assuming WIP limit of 3)]**

> "Watch what happens when a contributor tries to start a 4th task."

**[Screen: Error message / toast appears]**

> "The system blocks it. WIP limit reached. This is the core philosophy of PMS — finish what you started before starting something new."

> "As an Admin, you can adjust WIP limits per user from Users Management if someone's workload needs flexibility."

---

## SCENE 9: Wrap-Up (9:00 – 9:30)

**[Screen: Team Health dashboard overview]**

> "To recap — here's your daily workflow as a manager:"
>
> 1. "Check Team Health for overloads, blockers, and overdue tasks"
> 2. "Assign new work with + New Task"
> 3. "Monitor project health scores"
> 4. "Review weekly metrics for 1:1s"
>
> "For contributors — open My Workspace, check your Focus Dashboard, and move your tasks through the board."
>
> "That's PMS 0.1 — built to keep your team executing, not just planning."

**[End card: PMS 0.1 — Execution OS]**

---

## RECORDING TIPS

- **Resolution:** 1920x1080, browser at 90% zoom for clean capture
- **Browser:** Use Chrome with no extensions visible
- **Data:** Pre-seed some tasks/users before recording so dashboards aren't empty
- **Pacing:** Pause briefly after each action so viewers can follow
- **Mouse:** Move deliberately, avoid rapid clicking
- **Mistakes:** If you make a typo, just fix it and keep going — it feels more natural
- **Audio:** Record voiceover separately for cleaner audio, or use a decent USB mic if recording live
- **Tools:** OBS Studio (free) or Loom for screen recording
