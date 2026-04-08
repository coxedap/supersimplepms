import { Response } from "express";
import { TeamService } from "../application/team.service.interface";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";

export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  public async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const team = await this.teamService.createTeam({
        ...req.body,
        creatorId: req.user!.userId,
        organizationId: req.user!.organizationId,
      });
      res.status(201).json(team.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async addMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      await this.teamService.addMember({ ...req.body, requesterId: req.user!.userId });
      res.status(204).send();
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const team = await this.teamService.updateTeam(req.params.id, {
        ...req.body,
        requesterId: req.user!.userId,
      });
      res.json(team.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async removeMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      await this.teamService.removeMember({
        teamId: req.params.teamId,
        userId: req.params.userId,
        requesterId: req.user!.userId,
      });
      res.status(204).send();
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const teams = await this.teamService.getAllTeams(req.user!.organizationId);
      res.json(teams.map(t => t.getProps()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
