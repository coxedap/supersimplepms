import { Request, Response } from "express";
import { TeamService } from "../application/team.service.interface";

export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const team = await this.teamService.createTeam(req.body);
      res.status(201).json(team.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async addMember(req: Request, res: Response): Promise<void> {
    try {
      await this.teamService.addMember(req.body);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const team = await this.teamService.updateTeam(req.params.id, req.body);
      res.json(team.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async removeMember(req: Request, res: Response): Promise<void> {
    try {
      await this.teamService.removeMember({
        teamId: req.params.teamId,
        userId: req.params.userId,
        requesterId: req.body.requesterId,
      });
      res.status(204).send();
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async list(req: Request, res: Response): Promise<void> {
    try {
      const teams = await this.teamService.getAllTeams();
      res.json(teams.map(t => t.getProps()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
