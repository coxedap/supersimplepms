import { Response } from "express";
import { TaskService } from "../application/task.service.interface";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  public async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const task = await this.taskService.createTask({
        ...req.body,
        organizationId: req.user!.organizationId,
      });
      res.status(201).json(task.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const task = await this.taskService.updateTask(req.params.id, req.body);
      res.json(task.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async changeStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, reason } = req.body;
      const task = await this.taskService.changeStatus(req.params.id, status, reason);
      res.json(task.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async listByOwner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tasks = await this.taskService.listByOwner(req.params.ownerId, req.user!.organizationId);
      res.json(tasks.map(t => t.getProps()));
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await this.taskService.deleteTask(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async triggerOverdueCheck(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const count = await this.taskService.processOverdueTasks();
      res.json({ updated: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
