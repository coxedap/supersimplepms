import { PrismaClient, TaskStatus } from "@prisma/client";
import { Request, Response } from "express";
import { SystemService } from "../../system/application/system.service";

export interface RiskLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  reason?: string;
}

export interface FocusDashboardData {
  todayTasks: any[];
  atRiskTasks: any[];
  overdueTasks: any[];
  blockedTasks: any[];
  currentWIP: number;
  wipLimit: number;
}

export interface ProjectHealth {
  id: string;
  name: string;
  taskCount: number;
  statusDistribution: Record<string, number>;
  riskScore: number; // 0-100
}

export interface TeamDashboardData {
  tasksPerStatus: Record<string, number>;
  overdueByOwner: any[];
  overloadedUsers: any[];
  projectHealth: ProjectHealth[];
  allTeamTasks: any[]; // New field for detailed task view
}

export class DashboardService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly systemService: SystemService
  ) {}

  private calculateRisk(task: any): RiskLevel {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (task.status === 'DONE') return { level: 'LOW' };
    if (task.status === 'OVERDUE' || diffHours < 24) return { level: 'HIGH', reason: 'Deadline imminent' };
    if (diffHours < 48) return { level: 'MEDIUM', reason: 'Deadline approaching' };
    
    return { level: 'LOW' };
  }

  public async getFocusDashboard(userId: string): Promise<FocusDashboardData> {
    const tasks = await this.prisma.task.findMany({
      where: { ownerId: userId, status: { not: 'DONE' } },
    });

    const wipLimit = await this.systemService.getNumberConfig('WIP_LIMIT_PER_USER', 3);

    const tasksWithRisk = tasks.map(t => ({
      ...t,
      risk: this.calculateRisk(t)
    }));

    return {
      todayTasks: tasksWithRisk.filter(t => t.deadline <= new Date() && t.status !== 'BLOCKED'),
      atRiskTasks: tasksWithRisk.filter(t => t.risk.level !== 'LOW'),
      overdueTasks: tasksWithRisk.filter(t => t.status === 'OVERDUE'),
      blockedTasks: tasksWithRisk.filter(t => t.status === 'BLOCKED'),
      currentWIP: tasksWithRisk.filter(t => t.status === 'DOING').length,
      wipLimit,
    };
  }

  public async getTeamDashboard(): Promise<TeamDashboardData> {
    const tasks = await this.prisma.task.findMany({
      include: { owner: true, project: true } as any
    });

    const stats: Record<string, number> = {};
    Object.values(TaskStatus).forEach(s => stats[s] = 0);
    tasks.forEach((t: any) => {
      stats[t.status as string]++;
    });

    // Find overdue tasks and group by owner
    const overdueTasks = tasks.filter(t => t.status === 'OVERDUE');
    const overdueByOwnerMap = new Map();
    overdueTasks.forEach((t: any) => {
      if (!overdueByOwnerMap.has(t.ownerId)) {
        overdueByOwnerMap.set(t.ownerId, { ownerName: t.owner.name, count: 0, tasks: [] });
      }
      const ownerData = overdueByOwnerMap.get(t.ownerId);
      ownerData.count++;
      ownerData.tasks.push({ id: t.id, title: t.title, deadline: t.deadline });
    });

    // Find overloaded users (WIP >= limit)
    const wipLimit = await this.systemService.getNumberConfig('WIP_LIMIT_PER_USER', 3);
    const userWipMap = new Map();
    tasks.filter((t: any) => t.status === 'DOING').forEach((t: any) => {
      userWipMap.set(t.ownerId, (userWipMap.get(t.ownerId) || 0) + 1);
    });

    const overloadedUsers = [];
    for (const [userId, count] of userWipMap.entries()) {
      if (count >= wipLimit) {
        const taskWithUser = tasks.find(t => t.ownerId === userId) as any;
        const user = taskWithUser?.owner;
        if (user) overloadedUsers.push({ id: user.id, name: user.name, wipCount: count, limit: wipLimit });
      }
    }

    // Project Health
    const projectMap = new Map();
    const activeProjects = await this.prisma.project.findMany({ where: { status: 'active' } });
    
    activeProjects.forEach((p: any) => {
      projectMap.set(p.id, {
        id: p.id,
        name: p.name,
        taskCount: 0,
        statusDistribution: { TODO: 0, DOING: 0, DONE: 0, BLOCKED: 0, OVERDUE: 0 },
        riskScore: 0
      });
    });

    tasks.forEach((t: any) => {
      if (t.projectId && projectMap.has(t.projectId)) {
        const p = projectMap.get(t.projectId);
        p.taskCount++;
        p.statusDistribution[t.status as string]++;
        const risk = this.calculateRisk(t);
        if (risk.level === 'HIGH') p.riskScore += 20;
        else if (risk.level === 'MEDIUM') p.riskScore += 10;
      }
    });

    return {
      tasksPerStatus: stats,
      overdueByOwner: Array.from(overdueByOwnerMap.values()),
      overloadedUsers,
      projectHealth: Array.from(projectMap.values()),
      allTeamTasks: tasks.map((t: any) => ({
        ...t,
        ownerName: t.owner?.name || 'Unknown',
        projectName: t.project?.name || 'No Project',
        risk: this.calculateRisk(t)
      }))
    };
  }
}

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  public async getFocus(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.dashboardService.getFocusDashboard(req.params.userId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public async getTeam(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.dashboardService.getTeamDashboard();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
