import { Request, Response } from "express";
import { TaskService } from "../application/task.service.interface";

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.createTask(req.body);
      res.status(201).json(task.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.updateTask(req.params.id, req.body);
      res.json(task.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, reason } = req.body;
      const task = await this.taskService.changeStatus(req.params.id, status, reason);
      res.json(task.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async listByOwner(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.taskService.listByOwner(req.params.ownerId);
      res.json(tasks.map(t => t.getProps()));
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { requesterId } = req.body;
      await this.taskService.deleteTask(req.params.id, requesterId);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async triggerOverdueCheck(req: Request, res: Response): Promise<void> {
    try {
      const count = await this.taskService.processOverdueTasks();
      res.json({ updated: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
