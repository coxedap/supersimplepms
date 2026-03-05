import { Project, ProjectProps } from "../domain/project.entity";
import { ProjectRepository } from "../application/project.service.interface";
import { PrismaClient } from "@prisma/client";

export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(model: any): Project {
    return new Project({
      id: model.id,
      name: model.name,
      description: model.description || undefined,
      managerId: model.managerId,
      status: model.status as any,
      createdAt: model.createdAt
    });
  }

  public async findById(id: string): Promise<Project | null> {
    const model = await this.prisma.project.findUnique({ where: { id } });
    return model ? this.mapToDomain(model) : null;
  }

  public async save(project: Project): Promise<void> {
    const props = project.getProps();
    await this.prisma.project.create({
      data: {
        id: props.id,
        name: props.name,
        description: props.description,
        managerId: props.managerId,
        status: props.status
      }
    });
  }

  public async update(project: Project): Promise<void> {
    const props = project.getProps();
    await this.prisma.project.update({
      where: { id: props.id },
      data: {
        name: props.name,
        description: props.description,
        managerId: props.managerId,
        status: props.status
      }
    });
  }

  public async findAll(): Promise<Project[]> {
    const models = await this.prisma.project.findMany();
    return models.map(m => this.mapToDomain(m));
  }
}
