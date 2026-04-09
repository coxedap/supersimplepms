import express, { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './shared/middleware/auth.middleware';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './shared/middleware/auth.middleware';
import { prisma } from './shared/utils/prisma';
import { PrismaTaskRepository } from './modules/task/infrastructure/prisma.task.repository';
import { TaskServiceImpl } from './modules/task/application/task.service.impl';
import { TaskController } from './modules/task/controller/task.controller';
import { PrismaUserRepository } from './modules/user/infrastructure/prisma.user.repository';
import { UserServiceImpl } from './modules/user/application/user.service.impl';
import { UserController } from './modules/user/controller/user.controller';
import { DashboardService, DashboardController } from './modules/dashboard/application/dashboard.service';
import { PrismaProjectRepository } from './modules/project/infrastructure/prisma.project.repository';
import { ProjectServiceImpl } from './modules/project/application/project.service.impl';
import { ProjectController } from './modules/project/controller/project.controller';
import { PrismaTeamRepository } from './modules/team/infrastructure/prisma.team.repository';
import { TeamServiceImpl } from './modules/team/application/team.service.impl';
import { TeamController } from './modules/team/controller/team.controller';
import { MetricsService } from './modules/metrics/application/metrics.service';
import { MetricsController } from './modules/metrics/controller/metrics.controller';
import { SystemService } from './modules/system/application/system.service';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// DI Container
const systemService = new SystemService(prisma);

const dashboardService = new DashboardService(prisma, systemService);
const dashboardController = new DashboardController(dashboardService);

const userRepo = new PrismaUserRepository(prisma);
const userService = new UserServiceImpl(userRepo, prisma);
const userController = new UserController(userService);

const projectRepo = new PrismaProjectRepository(prisma);
const projectService = new ProjectServiceImpl(projectRepo, userRepo);
const projectController = new ProjectController(projectService);

const teamRepo = new PrismaTeamRepository(prisma);
const teamService = new TeamServiceImpl(teamRepo, userRepo);
const teamController = new TeamController(teamService);

const taskRepo = new PrismaTaskRepository(prisma);
const taskService = new TaskServiceImpl(taskRepo, userRepo, systemService);
const taskController = new TaskController(taskService);

const metricsService = new MetricsService(prisma);
const metricsController = new MetricsController(metricsService);

// Public routes (no auth required)
app.post('/api/auth/login', (req: Request, res: Response) => userController.login(req, res));
app.post('/api/auth/register', (req: Request, res: Response) => userController.register(req, res));
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
});
app.post('/api/auth/invite/accept', (req: Request, res: Response) => userController.acceptInvite(req, res));

// 404 for unmatched public routes before auth
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  next();
});

// All routes below require a valid JWT
app.use(authMiddleware);

app.get('/api/users', (req: AuthRequest, res: Response) => userController.listAll(req, res));
app.post('/api/users/invite', (req: AuthRequest, res: Response) => userController.inviteMember(req, res));
app.patch('/api/users/:id/role', (req: AuthRequest, res: Response) => userController.updateRole(req, res));
app.patch('/api/users/:id/team', (req: AuthRequest, res: Response) => userController.updateTeam(req, res));
app.patch('/api/users/:id/limits', (req: AuthRequest, res: Response) => userController.updateLimits(req, res));
app.patch('/api/users/:id/status', (req: AuthRequest, res: Response) => userController.updateStatus(req, res));

// Project Routes
app.post('/api/projects', (req: AuthRequest, res: Response) => projectController.create(req, res));
app.get('/api/projects', (req: AuthRequest, res: Response) => projectController.list(req, res));
app.get('/api/projects/:id', (req: AuthRequest, res: Response) => projectController.get(req, res));
app.put('/api/projects/:id', (req: AuthRequest, res: Response) => projectController.update(req, res));

// Team Routes
app.post('/api/teams', (req: AuthRequest, res: Response) => teamController.create(req, res));
app.get('/api/teams', (req: AuthRequest, res: Response) => teamController.list(req, res));
app.patch('/api/teams/:id', (req: AuthRequest, res: Response) => teamController.update(req, res));
app.post('/api/teams/members', (req: AuthRequest, res: Response) => teamController.addMember(req, res));
app.delete('/api/teams/:teamId/members/:userId', (req: AuthRequest, res: Response) => teamController.removeMember(req, res));

// Dashboard Routes
app.get('/api/dashboard/focus/:userId', (req: AuthRequest, res: Response) => dashboardController.getFocus(req, res));
app.get('/api/dashboard/team', (req: AuthRequest, res: Response) => dashboardController.getTeam(req, res));

// Task Routes
app.post('/api/tasks', (req: AuthRequest, res: Response) => taskController.create(req, res));
app.put('/api/tasks/:id', (req: AuthRequest, res: Response) => taskController.update(req, res));
app.patch('/api/tasks/:id/status', (req: AuthRequest, res: Response) => taskController.changeStatus(req, res));
app.get('/api/tasks/owner/:ownerId', (req: AuthRequest, res: Response) => taskController.listByOwner(req, res));
app.delete('/api/tasks/:id', (req: AuthRequest, res: Response) => taskController.delete(req, res));
app.post('/api/tasks/system/check-overdue', (req: AuthRequest, res: Response) => taskController.triggerOverdueCheck(req, res));

// Metrics Routes
app.get('/api/metrics/weekly/:userId', (req: AuthRequest, res: Response) => metricsController.getWeeklyMetrics(req, res));

// Health check
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('ERROR:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
