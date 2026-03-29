import { User, UserProps } from "../domain/user.entity";
import { UserRepository, UserService, UpdateRoleDTO, UpdateTeamDTO, UpdateLimitsDTO, UpdateStatusDTO } from "./user.service.interface";
import { NotFoundError, ValidationError } from "../../../shared/errors/base.errors";
import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly prisma?: PrismaClient
  ) {}

  public async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("User", id);
    return user;
  }

  public async getAllUsers(): Promise<User[] | any> {
    return this.userRepo.findAll();
  }

  public async register(data: { name: string; role: string; team?: string }): Promise<User> {
    const user = new User({
      id: crypto.randomUUID(),
      name: data.name,
      role: data.role as any,
      status: 'active',
      wipLimit: 3,
      p1Limit: 1
    });
    await this.userRepo.save(user);
    return user;
  }

  public async updateRole(userId: string, dto: UpdateRoleDTO): Promise<User> {
    // Only ADMIN can change roles
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);
    
    const requesterRole = requester.getProps().role;
    if (requesterRole !== 'ADMIN') {
      throw new ValidationError("Only ADMIN can change user roles");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    const props = user.getProps();
    const updatedUser = new User({
      ...props,
      role: dto.newRole as any
    });

    await this.userRepo.update(updatedUser);
    return updatedUser;
  }

  public async updateTeam(userId: string, dto: UpdateTeamDTO): Promise<User> {
    // ADMIN can change any team, MANAGER can change any team, TEAM_LEAD can only change for their own team
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);
    
    const requesterRole = requester.getProps().role;
    const requesterProps = requester.getProps();

    if (requesterRole === 'CONTRIBUTOR') {
      throw new ValidationError("CONTRIBUTOR cannot change team assignments");
    }

    // TEAM_LEAD can only change users in their team
    if (requesterRole === 'TEAM_LEAD') {
      if (!this.prisma) throw new Error("Prisma client not available");
      
      // Check if new team exists and if requester is the lead
      if (dto.teamId) {
        const team = await this.prisma.team.findUnique({
          where: { id: dto.teamId }
        });
        if (!team) throw new NotFoundError("Team", dto.teamId);
        if (team.leaderId !== dto.requesterId) {
          throw new ValidationError("TEAM_LEAD can only assign users to their own team");
        }
      }
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    const props = user.getProps();
    const updatedUser = new User({
      ...props,
      teamId: dto.teamId || undefined
    });

    await this.userRepo.update(updatedUser);
    return updatedUser;
  }

  public async updateLimits(userId: string, dto: UpdateLimitsDTO): Promise<User> {
    // Only ADMIN or MANAGER can change limits
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);
    
    const requesterRole = requester.getProps().role;
    if (requesterRole !== 'ADMIN' && requesterRole !== 'MANAGER') {
      throw new ValidationError("Only ADMIN or MANAGER can change user limits");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    if (dto.wipLimitOverride !== undefined && dto.wipLimitOverride <= 0) {
      throw new ValidationError("WIP limit must be greater than 0");
    }
    if (dto.p1LimitOverride !== undefined && dto.p1LimitOverride <= 0) {
      throw new ValidationError("P1 limit must be greater than 0");
    }

    const props = user.getProps();
    const updatedUser = new User({
      ...props,
      wipLimitOverride: dto.wipLimitOverride,
      p1LimitOverride: dto.p1LimitOverride
    });

    await this.userRepo.update(updatedUser);
    return updatedUser;
  }

  public async updateStatus(userId: string, dto: UpdateStatusDTO): Promise<User> {
    // Only ADMIN can deactivate users
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);
    
    const requesterRole = requester.getProps().role;
    if (requesterRole !== 'ADMIN') {
      throw new ValidationError("Only ADMIN can change user status");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    const props = user.getProps();
    
    // If deactivating, block all active tasks
    if (dto.status === 'inactive' && props.status === 'active') {
      if (!this.prisma) throw new Error("Prisma client not available");
      
      const activeTasks = await this.prisma.task.findMany({
        where: {
          ownerId: userId,
          status: { in: ['TODO', 'DOING'] }
        }
      });

      for (const task of activeTasks) {
        await this.prisma.task.update({
          where: { id: task.id },
          data: {
            status: 'BLOCKED',
            blockerReason: 'Owner deactivated',
            blockedAt: new Date()
          }
        });
      }
    }

    const updatedUser = new User({
      ...props,
      status: dto.status
    });

    await this.userRepo.update(updatedUser);
    return updatedUser;
  }
}
