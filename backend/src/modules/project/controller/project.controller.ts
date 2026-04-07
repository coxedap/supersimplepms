import { Response } from "express";
import { ProjectService } from "../application/project.service.interface";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  public async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const project = await this.projectService.createProject({
        ...req.body,
        creatorId: req.user!.userId,
        organizationId: req.user!.organizationId,
      });
      res.status(201).json(project.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const project = await this.projectService.updateProject(req.params.id, {
        ...req.body,
        requesterId: req.user!.userId,
      });
      res.json(project.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async get(req: AuthRequest, res: Response): Promise<void> {
    try {
      const project = await this.projectService.getProject(req.params.id);
      res.json(project.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const projects = await this.projectService.getAllProjects(req.user!.organizationId);
      res.json(projects.map(p => p.getProps()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
