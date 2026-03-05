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
}
