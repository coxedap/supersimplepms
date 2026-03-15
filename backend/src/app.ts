import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
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

app.use(cors());
app.use(express.json());

// DI Container
const systemService = new SystemService(prisma);

const dashboardService = new DashboardService(prisma, systemService);
const dashboardController = new DashboardController(dashboardService);

const userRepo = new PrismaUserRepository(prisma);
const userService = new UserServiceImpl(userRepo);
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

// Auth/User Routes
app.post('/auth/login', (req: Request, res: Response) => userController.login(req, res));
app.post('/auth/register', (req: Request, res: Response) => userController.register(req, res));
app.get('/users', (req: Request, res: Response) => userController.listAll(req, res));

// Project Routes
app.post('/projects', (req: Request, res: Response) => projectController.create(req, res));
app.get('/projects', (req: Request, res: Response) => projectController.list(req, res));
app.get('/projects/:id', (req: Request, res: Response) => projectController.get(req, res));
app.put('/projects/:id', (req: Request, res: Response) => projectController.update(req, res));

// Team Routes
app.post('/teams', (req: Request, res: Response) => teamController.create(req, res));
app.get('/teams', (req: Request, res: Response) => teamController.list(req, res));
app.post('/teams/members', (req: Request, res: Response) => teamController.addMember(req, res));

// Dashboard Routes
app.get('/dashboard/focus/:userId', (req: Request, res: Response) => dashboardController.getFocus(req, res));
app.get('/dashboard/team', (req: Request, res: Response) => dashboardController.getTeam(req, res));

// Task Routes
app.post('/tasks', (req: Request, res: Response) => taskController.create(req, res));
app.put('/tasks/:id', (req: Request, res: Response) => taskController.update(req, res));
app.patch('/tasks/:id/status', (req: Request, res: Response) => taskController.changeStatus(req, res));
app.get('/tasks/owner/:ownerId', (req: Request, res: Response) => taskController.listByOwner(req, res));
app.delete('/tasks/:id', (req: Request, res: Response) => taskController.delete(req, res));
app.post('/tasks/system/check-overdue', (req: Request, res: Response) => taskController.triggerOverdueCheck(req, res));

// Metrics Routes
app.get('/metrics/weekly/:userId', (req: Request, res: Response) => metricsController.getWeeklyMetrics(req, res));

// Health check
app.get('/health', (req: Request, res: Response) => res.json({ status: 'ok' }));

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('ERROR:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
