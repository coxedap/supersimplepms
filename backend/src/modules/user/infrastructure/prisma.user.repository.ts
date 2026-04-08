import { User, UserProps } from "../domain/user.entity";
import { UserRepository } from "../application/user.service.interface";
import { PrismaClient } from "@prisma/client";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(model: any): User {
    return new User({
      id: model.id,
      name: model.name,
      email: model.email,
      role: model.role as any,
      teamId: model.teamId || undefined,
      team: model.team?.name || undefined,
      status: model.status,
      organizationId: model.organizationId,
      wipLimit: 3,
      p1Limit: 1,
      wipLimitOverride: model.wipLimitOverride || undefined,
      p1LimitOverride: model.p1LimitOverride || undefined,
    });
  }

  public async findById(id: string): Promise<User | null> {
    const model = await this.prisma.user.findUnique({
      where: { id },
      include: { team: true },
    });
    return model ? this.mapToDomain(model) : null;
  }

  public async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const model = await this.prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });
    if (!model) return null;
    const user = this.mapToDomain(model) as User & { passwordHash: string };
    user.passwordHash = model.passwordHash;
    return user;
  }

  public async findAll(organizationId: string): Promise<User[]> {
    const models = await this.prisma.user.findMany({
      where: { organizationId },
      include: { team: true },
    });
    return models.map((m) => this.mapToDomain(m));
  }

  public async save(user: User, passwordHash: string): Promise<void> {
    const props = user.getProps();
    await this.prisma.user.create({
      data: {
        id: props.id,
        name: props.name,
        email: props.email,
        passwordHash,
        role: props.role,
        teamId: props.teamId,
        status: props.status,
        organizationId: props.organizationId,
        wipLimitOverride: props.wipLimitOverride,
        p1LimitOverride: props.p1LimitOverride,
      },
    });
  }

  public async update(user: User): Promise<void> {
    const props = user.getProps();
    await this.prisma.user.update({
      where: { id: props.id },
      data: {
        name: props.name,
        role: props.role,
        teamId: props.teamId,
        status: props.status,
        wipLimitOverride: props.wipLimitOverride,
        p1LimitOverride: props.p1LimitOverride,
        updatedAt: new Date(),
      },
    });
  }
}
