import { Request, Response } from "express";
import { ProjectService } from "../application/project.service.interface";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.projectService.createProject(req.body);
      res.status(201).json(project.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.projectService.updateProject(req.params.id, req.body);
      res.json(project.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async get(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.projectService.getProject(req.params.id);
      res.json(project.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async list(req: Request, res: Response): Promise<void> {
    try {
      const projects = await this.projectService.getAllProjects();
      res.json(projects.map(p => p.getProps()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
