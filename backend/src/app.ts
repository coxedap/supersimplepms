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

const app = express();

app.use(cors());
app.use(express.json());

// DI Container (simplified)
const dashboardService = new DashboardService(prisma);
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
const taskService = new TaskServiceImpl(taskRepo, userRepo, new (require('./modules/system/application/system.service').SystemService)(prisma));
const taskController = new TaskController(taskService);

// Auth/User Routes
app.post('/auth/login', (req, res) => userController.login(req, res));
app.post('/auth/register', (req, res) => userController.register(req, res));
app.get('/users', (req, res) => userController.listAll(req, res));

// Project Routes
app.post('/projects', (req, res) => projectController.create(req, res));
app.get('/projects', (req, res) => projectController.list(req, res));
app.get('/projects/:id', (req, res) => projectController.get(req, res));
app.put('/projects/:id', (req, res) => projectController.update(req, res));

// Team Routes
app.post('/teams', (req, res) => teamController.create(req, res));
app.get('/teams', (req, res) => teamController.list(req, res));
app.post('/teams/members', (req, res) => teamController.addMember(req, res));

// Dashboard Routes
app.get('/dashboard/focus/:userId', (req, res) => dashboardController.getFocus(req, res));
app.get('/dashboard/team', (req, res) => dashboardController.getTeam(req, res));

// Task Routes
app.post('/tasks', (req, res) => taskController.create(req, res));
app.put('/tasks/:id', (req, res) => taskController.update(req, res));
app.patch('/tasks/:id/status', (req, res) => taskController.changeStatus(req, res));
app.get('/tasks/owner/:ownerId', (req, res) => taskController.listByOwner(req, res));
app.delete('/tasks/:id', (req, res) => taskController.delete(req, res));
app.post('/tasks/system/check-overdue', (req, res) => taskController.triggerOverdueCheck(req, res));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('ERROR:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
