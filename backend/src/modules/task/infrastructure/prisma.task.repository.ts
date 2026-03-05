import { Task, TaskProps, TaskStatus, Priority } from "../domain/task.entity";
import { TaskRepository } from "../application/task.service.interface";
import { PrismaClient } from "@prisma/client";

export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(model: any): Task {
    return Task.create({
      id: model.id,
      title: model.title,
      description: model.description || undefined,
      ownerId: model.ownerId,
      projectId: model.projectId || undefined,
      priority: model.priority as Priority,
      status: model.status as TaskStatus,
      deadline: model.deadline,
      estimatedEffort: model.estimatedEffort,
      actualEffort: model.actualEffort || undefined,
      blockerReason: model.blockerReason || undefined,
      blockedAt: model.blockedAt || undefined,
      startedAt: model.startedAt || undefined,
      createdAt: model.createdAt,
      completedAt: model.completedAt || undefined,
    });
  }

  public async findById(id: string): Promise<Task | null> {
    const model = await this.prisma.task.findUnique({ where: { id } });
    return model ? this.mapToDomain(model) : null;
  }

  public async save(task: Task): Promise<void> {
    const props = task.getProps();
    await this.prisma.task.create({
      data: {
        id: props.id,
        title: props.title,
        description: props.description,
        ownerId: props.ownerId,
        projectId: props.projectId,
        priority: props.priority,
        status: props.status,
        deadline: props.deadline,
        estimatedEffort: props.estimatedEffort,
        createdAt: props.createdAt,
      }
    });
  }

  public async update(task: Task): Promise<void> {
    const props = task.getProps();
    await this.prisma.task.update({
      where: { id: props.id },
      data: {
        title: props.title,
        description: props.description,
        ownerId: props.ownerId,
        projectId: props.projectId,
        priority: props.priority,
        status: props.status,
        deadline: props.deadline,
        estimatedEffort: props.estimatedEffort,
        actualEffort: props.actualEffort,
        blockerReason: props.blockerReason,
        blockedAt: props.blockedAt,
        startedAt: props.startedAt,
        completedAt: props.completedAt,
      }
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  public async listByOwner(ownerId: string): Promise<Task[]> {
    const models = await this.prisma.task.findMany({ where: { ownerId } });
    return models.map(m => this.mapToDomain(m));
  }

  public async findAllActive(): Promise<Task[]> {
    const models = await this.prisma.task.findMany({
      where: {
        status: { not: 'DONE' }
      }
    });
    return models.map(m => this.mapToDomain(m));
  }

  public async countActiveByOwner(ownerId: string): Promise<number> {
    return this.prisma.task.count({
      where: {
        ownerId,
        status: { in: ['DOING'] } // WIP is only active tasks
      }
    });
  }

  public async countP1ByOwner(ownerId: string): Promise<number> {
    return this.prisma.task.count({
      where: {
        ownerId,
        priority: 'P1',
        status: { not: 'DONE' }
      }
    });
  }
}
