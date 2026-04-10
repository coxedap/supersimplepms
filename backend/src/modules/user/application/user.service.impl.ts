import bcrypt from 'bcrypt';
import { User } from "../domain/user.entity";
import {
  UserRepository,
  UserService,
  UpdateRoleDTO,
  UpdateTeamDTO,
  UpdateLimitsDTO,
  UpdateStatusDTO,
  RegisterDTO,
  LoginDTO,
  AddMemberDTO,
  SetupPasswordDTO,
  InviteMemberDTO,
  AcceptInviteDTO,
} from "./user.service.interface";
import { NotFoundError, ValidationError } from "../../../shared/errors/base.errors";
import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';
import { sendInviteEmail } from "../../../shared/utils/mailer";

const SALT_ROUNDS = 12;

export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly prisma: PrismaClient
  ) {}

  public async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("User", id);
    return user;
  }

  public async getAllUsers(organizationId: string): Promise<User[]> {
    return this.userRepo.findAll(organizationId);
  }

  public async checkEmail(email: string): Promise<{ status: 'active' | 'setup_required' | 'not_found' }> {
    const user = await this.userRepo.findByEmail(email);
    if (user) {
      if (user.getProps().status === 'inactive') return { status: 'setup_required' };
      return { status: 'active' };
    }

    // Check for a pending invite
    const invite = await this.prisma.invite.findFirst({
      where: {
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (invite) return { status: 'setup_required' };

    return { status: 'not_found' };
  }

  public async login(dto: LoginDTO): Promise<User> {
    const userWithHash = await this.userRepo.findByEmail(dto.email);
    if (!userWithHash) throw new ValidationError("Invalid email or password");

    if (userWithHash.getProps().status === 'inactive') {
      const err: any = new Error("REQUIRES_SETUP");
      err.statusCode = 403;
      err.code = 'REQUIRES_SETUP';
      throw err;
    }

    const valid = await bcrypt.compare(dto.password, userWithHash.passwordHash);
    if (!valid) throw new ValidationError("Invalid email or password");

    return userWithHash;
  }

  public async register(dto: RegisterDTO): Promise<User> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ValidationError("Email already in use");

    // Create the organization first
    const slug = dto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const org = await this.prisma.organization.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.organizationName,
        slug: `${slug}-${crypto.randomUUID().slice(0, 6)}`,
      },
    });

    // Seed default system configs for the org
    await this.prisma.systemConfig.createMany({
      data: [
        { id: crypto.randomUUID(), key: 'WIP_LIMIT_PER_USER', value: '3', organizationId: org.id },
        { id: crypto.randomUUID(), key: 'P1_LIMIT_PER_USER', value: '1', organizationId: org.id },
      ],
    });

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = new User({
      id: crypto.randomUUID(),
      name: dto.name,
      email: dto.email,
      role: 'ADMIN',
      status: 'active',
      organizationId: org.id,
      wipLimit: 3,
      p1Limit: 1,
    });

    await this.userRepo.save(user, passwordHash);
    return user;
  }

  public async addMember(dto: AddMemberDTO): Promise<void> {
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);
    if (requester.getProps().role !== 'ADMIN') {
      throw new ValidationError("Only ADMIN can directly add members");
    }

    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ValidationError("Email already in use");

    // Create user as inactive with no password — they set it on first login
    const user = new User({
      id: crypto.randomUUID(),
      name: dto.email.split('@')[0], // placeholder name until they set it
      email: dto.email,
      role: dto.role as any,
      status: 'inactive',
      organizationId: dto.organizationId,
      wipLimit: 3,
      p1Limit: 1,
    });

    await this.userRepo.save(user, ''); // empty passwordHash — no login until setup
  }

  public async setupPassword(dto: SetupPasswordDTO): Promise<User> {
    if (dto.password.length < 8) throw new ValidationError("Password must be at least 8 characters");

    const existingUser = await this.userRepo.findByEmail(dto.email);

    // Case 1: inactive user created directly by admin
    if (existingUser && existingUser.getProps().status === 'inactive') {
      const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      const updatedUser = new User({ ...existingUser.getProps(), name: dto.name, status: 'active' });
      await this.userRepo.update(updatedUser);
      await this.prisma.user.update({ where: { id: updatedUser.getProps().id }, data: { passwordHash } });
      return updatedUser;
    }

    // Case 2: pending invite
    const invite = await this.prisma.invite.findFirst({
      where: { email: dto.email, acceptedAt: null, expiresAt: { gt: new Date() } },
    });
    if (invite) {
      const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      const user = new User({
        id: crypto.randomUUID(),
        name: dto.name,
        email: invite.email,
        role: invite.role as any,
        status: 'active',
        organizationId: invite.organizationId,
        wipLimit: 3,
        p1Limit: 1,
      });
      await this.userRepo.save(user, passwordHash);
      await this.prisma.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
      return user;
    }

    throw new ValidationError("No pending account or invite found for this email");
  }

  public async inviteMember(dto: InviteMemberDTO): Promise<void> {
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);
    const requesterProps = requester.getProps();
    if (requesterProps.role !== 'ADMIN' && requesterProps.role !== 'MANAGER') {
      throw new ValidationError("Only ADMIN or MANAGER can invite members");
    }

    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ValidationError("Email already in use");

    // Check no pending (unexpired, unaccepted) invite already exists for this email+org
    const pendingInvite = await this.prisma.invite.findFirst({
      where: {
        email: dto.email,
        organizationId: dto.organizationId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (pendingInvite) throw new ValidationError("A pending invite already exists for this email");

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.invite.create({
      data: {
        id: crypto.randomUUID(),
        email: dto.email,
        role: dto.role as any,
        token,
        organizationId: dto.organizationId,
        invitedById: dto.requesterId,
        expiresAt,
      },
    });

    const org = await this.prisma.organization.findUnique({ where: { id: dto.organizationId } });
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const inviteUrl = `${appUrl}/invite/accept?token=${token}`;

    sendInviteEmail({
      to: dto.email,
      inviterName: requesterProps.name,
      orgName: org?.name ?? 'your organization',
      inviteUrl,
    }).catch((err) => console.error('Failed to send invite email:', err));
  }

  public async acceptInvite(dto: AcceptInviteDTO): Promise<User> {
    const invite = await this.prisma.invite.findUnique({ where: { token: dto.token } });
    if (!invite) throw new ValidationError("Invalid or expired invite link");
    if (invite.acceptedAt) throw new ValidationError("This invite has already been used");
    if (invite.expiresAt < new Date()) throw new ValidationError("This invite link has expired");

    const existing = await this.userRepo.findByEmail(invite.email);
    if (existing) throw new ValidationError("An account with this email already exists");

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = new User({
      id: crypto.randomUUID(),
      name: dto.name,
      email: invite.email,
      role: invite.role as any,
      status: 'active',
      organizationId: invite.organizationId,
      wipLimit: 3,
      p1Limit: 1,
    });

    await this.userRepo.save(user, passwordHash);
    await this.prisma.invite.update({
      where: { token: dto.token },
      data: { acceptedAt: new Date() },
    });

    return user;
  }

  public async deleteMember(userId: string, requesterId: string): Promise<void> {
    const requester = await this.userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError("User", requesterId);
    if (requester.getProps().role !== 'ADMIN') {
      throw new ValidationError("Only ADMIN can delete members");
    }
    if (userId === requesterId) {
      throw new ValidationError("You cannot delete your own account");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    const activeTasks = await this.prisma.task.count({
      where: { ownerId: userId, status: { in: ['TODO', 'DOING'] } },
    });
    if (activeTasks > 0) {
      throw new ValidationError(`Cannot delete user with ${activeTasks} active task(s). Reassign or close them first.`);
    }

    const managedProjects = await this.prisma.project.count({ where: { managerId: userId } });
    if (managedProjects > 0) {
      throw new ValidationError(`Cannot delete user who manages ${managedProjects} project(s). Reassign the projects first.`);
    }

    await this.userRepo.delete(userId);
  }

  public async updateRole(userId: string, dto: UpdateRoleDTO): Promise<User> {
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);
    if (requester.getProps().role !== 'ADMIN') {
      throw new ValidationError("Only ADMIN can change user roles");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    const updatedUser = new User({ ...user.getProps(), role: dto.newRole as any });
    await this.userRepo.update(updatedUser);
    return updatedUser;
  }

  public async updateTeam(userId: string, dto: UpdateTeamDTO): Promise<User> {
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);

    const requesterRole = requester.getProps().role;
    if (requesterRole === 'CONTRIBUTOR') {
      throw new ValidationError("CONTRIBUTOR cannot change team assignments");
    }

    if (requesterRole === 'TEAM_LEAD' && dto.teamId) {
      const team = await this.prisma.team.findUnique({ where: { id: dto.teamId } });
      if (!team) throw new NotFoundError("Team", dto.teamId);
      if (team.leaderId !== dto.requesterId) {
        throw new ValidationError("TEAM_LEAD can only assign users to their own team");
      }
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    const updatedUser = new User({ ...user.getProps(), teamId: dto.teamId || undefined });
    await this.userRepo.update(updatedUser);
    return updatedUser;
  }

  public async updateLimits(userId: string, dto: UpdateLimitsDTO): Promise<User> {
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

    const updatedUser = new User({
      ...user.getProps(),
      wipLimitOverride: dto.wipLimitOverride,
      p1LimitOverride: dto.p1LimitOverride,
    });
    await this.userRepo.update(updatedUser);
    return updatedUser;
  }

  public async updateStatus(userId: string, dto: UpdateStatusDTO): Promise<User> {
    const requester = await this.userRepo.findById(dto.requesterId);
    if (!requester) throw new NotFoundError("User", dto.requesterId);
    if (requester.getProps().role !== 'ADMIN') {
      throw new ValidationError("Only ADMIN can change user status");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    const props = user.getProps();
    if (dto.status === 'inactive' && props.status === 'active') {
      const activeTasks = await this.prisma.task.findMany({
        where: { ownerId: userId, status: { in: ['TODO', 'DOING'] } },
      });
      for (const task of activeTasks) {
        await this.prisma.task.update({
          where: { id: task.id },
          data: { status: 'BLOCKED', blockerReason: 'Owner deactivated', blockedAt: new Date() },
        });
      }
    }

    const updatedUser = new User({ ...props, status: dto.status });
    await this.userRepo.update(updatedUser);
    return updatedUser;
  }
}
