import { User, UserProps } from "../domain/user.entity";
import { UserRepository } from "../application/user.service.interface";
import { PrismaClient } from "@prisma/client";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(model: any): User {
    return new User({
      id: model.id,
      name: model.name,
      role: model.role as any,
      teamId: model.teamId || undefined,
      team: model.team?.name || undefined,
      status: model.status,
      wipLimit: 3, // Default or from config
      p1Limit: 1    // Default or from config
    });
  }

  public async findById(id: string): Promise<User | null> {
    const model = await this.prisma.user.findUnique({ 
      where: { id },
      include: { team: true }
    });
    return model ? this.mapToDomain(model) : null;
  }

  public async findAll(): Promise<User[]> {
    const models = await this.prisma.user.findMany({
      include: { team: true }
    });
    return models.map(m => this.mapToDomain(m));
  }

  public async save(user: User): Promise<void> {
    const props = user.getProps();
    await this.prisma.user.create({
      data: {
        id: props.id,
        name: props.name,
        role: props.role,
        teamId: props.teamId,
        status: props.status,
      }
    });
  }
}
