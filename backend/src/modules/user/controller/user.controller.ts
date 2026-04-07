import { Request, Response } from "express";
import { UserService } from "../application/user.service.interface";
import { signToken } from "../../../shared/utils/jwt";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";

export class UserController {
  constructor(private readonly userService: UserService) {}

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await this.userService.login({ email, password });
      const props = user.getProps();
      const token = signToken({ userId: props.id, role: props.role, organizationId: props.organizationId });

      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
      });
      res.json(props);
    } catch (error: any) {
      res.status(error.statusCode || 401).json({ error: error.message });
    }
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, organizationName } = req.body;
      if (!name || !email || !password || !organizationName) {
        res.status(400).json({ error: 'name, email, password, and organizationName are required' });
        return;
      }

      const user = await this.userService.register({ name, email, password, organizationName });
      const props = user.getProps();
      const token = signToken({ userId: props.id, role: props.role, organizationId: props.organizationId });

      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
      });
      res.status(201).json(props);
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ error: error.message });
    }
  }

  public async listAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user!.organizationId;
      const users = await this.userService.getAllUsers(organizationId);
      res.json(users.map((u) => u.getProps()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public async inviteMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, role } = req.body;
      if (!email || !role) {
        res.status(400).json({ error: 'email and role are required' });
        return;
      }
      await this.userService.inviteMember({
        email,
        role,
        organizationId: req.user!.organizationId,
        requesterId: req.user!.userId,
      });
      res.status(200).json({ message: 'Invite sent successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ error: error.message });
    }
  }

  public async acceptInvite(req: Request, res: Response): Promise<void> {
    try {
      const { token, name, password } = req.body;
      if (!token || !name || !password) {
        res.status(400).json({ error: 'token, name, and password are required' });
        return;
      }
      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }
      const user = await this.userService.acceptInvite({ token, name, password });
      const props = user.getProps();
      const jwtToken = signToken({ userId: props.id, role: props.role, organizationId: props.organizationId });

      res.cookie('token', jwtToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
      });
      res.status(201).json(props);
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ error: error.message });
    }
  }

  public async updateRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newRole } = req.body;
      const user = await this.userService.updateRole(id, { requesterId: req.user!.userId, newRole });
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async updateTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { teamId } = req.body;
      const user = await this.userService.updateTeam(id, { requesterId: req.user!.userId, teamId });
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async updateLimits(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { wipLimitOverride, p1LimitOverride } = req.body;
      const user = await this.userService.updateLimits(id, { requesterId: req.user!.userId, wipLimitOverride, p1LimitOverride });
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  public async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await this.userService.updateStatus(id, { requesterId: req.user!.userId, status });
      res.json(user.getProps());
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
