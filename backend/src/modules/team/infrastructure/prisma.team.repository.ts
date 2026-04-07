import { Team, TeamProps } from "../domain/team.entity";
import { TeamRepository } from "../application/team.service.interface";
import { PrismaClient } from "@prisma/client";

export class PrismaTeamRepository implements TeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(model: any): Team {
    return new Team({
      id: model.id,
      name: model.name,
      leaderId: model.leaderId || undefined,
      organizationId: model.organizationId,
      createdAt: model.createdAt
    });
  }

  public async findById(id: string): Promise<Team | null> {
    const model = await this.prisma.team.findUnique({ where: { id } });
    return model ? this.mapToDomain(model) : null;
  }

  public async save(team: Team): Promise<void> {
    const props = team.getProps();
    await this.prisma.team.create({
      data: {
        id: props.id,
        name: props.name,
        leaderId: props.leaderId,
        organizationId: props.organizationId,
      }
    });
  }

  public async update(team: Team): Promise<void> {
    const props = team.getProps();
    await this.prisma.team.update({
      where: { id: props.id },
      data: {
        name: props.name,
        leaderId: props.leaderId
      }
    });
  }

  public async findAll(organizationId: string): Promise<Team[]> {
    const models = await this.prisma.team.findMany({ where: { organizationId } });
    return models.map(m => this.mapToDomain(m));
  }

  public async addMember(teamId: string, userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { teamId }
    });
  }

  public async removeMember(teamId: string, userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { teamId: null }
    });
  }
}
