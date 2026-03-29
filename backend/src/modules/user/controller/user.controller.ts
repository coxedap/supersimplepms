import { Request, Response } from "express";
import { UserService } from "../application/user.service.interface";

export class UserController {
  constructor(private readonly userService: UserService) {}

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const user = await this.userService.getUser(userId);
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.register(req.body);
      res.status(201).json(user.getProps());
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public async listAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users.map((u: any) => u.getProps()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { requesterId, newRole } = req.body;
      const user = await this.userService.updateRole(id, { requesterId, newRole });
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async updateTeam(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { requesterId, teamId } = req.body;
      const user = await this.userService.updateTeam(id, { requesterId, teamId });
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async updateLimits(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { requesterId, wipLimitOverride, p1LimitOverride } = req.body;
      const user = await this.userService.updateLimits(id, {
        requesterId,
        wipLimitOverride,
        p1LimitOverride
      });
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { requesterId, status } = req.body;
      const user = await this.userService.updateStatus(id, { requesterId, status });
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
