import { Task, TaskProps, TaskStatus, Priority } from "../domain/task.entity";
import { CreateTaskDTO, TaskRepository, TaskService, UpdateTaskDTO } from "./task.service.interface";
import { DomainError, NotFoundError, ValidationError } from "../../../shared/errors/base.errors";
import { SystemService } from "../../system/application/system.service";
import crypto from 'crypto';

export class TaskServiceImpl implements TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly userRepo: any,
    private readonly systemService: SystemService
  ) {}

  private async getLimits(organizationId: string) {
    return {
      wipLimit: await this.systemService.getNumberConfig(organizationId, 'WIP_LIMIT_PER_USER', 3),
      p1Limit: await this.systemService.getNumberConfig(organizationId, 'P1_LIMIT_PER_USER', 1)
    };
  }

  public async createTask(data: CreateTaskDTO): Promise<Task> {
    const creator = await this.userRepo.findById(data.creatorId);
    if (!creator) throw new NotFoundError("Creator", data.creatorId);
    const creatorRole = creator.getProps().role;
    if (creatorRole === 'CONTRIBUTOR') {
        throw new ValidationError("Only admins, managers, and team leads can create and assign tasks");
    }

    const user = await this.userRepo.findById(data.ownerId);
    if (!user) throw new NotFoundError("User", data.ownerId);

    const { wipLimit, p1Limit } = await this.getLimits(data.organizationId);

    const activeCount = await this.taskRepo.countActiveByOwner(data.ownerId);
    if (activeCount >= wipLimit) {
      throw new ValidationError(`User has reached WIP limit of ${wipLimit}`);
    }

    if (data.priority === 'P1') {
      const p1Count = await this.taskRepo.countP1ByOwner(data.ownerId);
      if (p1Count >= p1Limit) {
        throw new ValidationError(`User has reached P1 limit of ${p1Limit}`);
      }
    }

    const task = Task.create({
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      ownerId: data.ownerId,
      projectId: data.projectId,
      priority: data.priority,
      deadline: new Date(data.deadline),
      estimatedEffort: data.estimatedEffort,
      status: 'TODO',
      createdAt: new Date(),
      organizationId: data.organizationId,
    });

    await this.taskRepo.save(task);
    return task;
  }

  public async updateTask(id: string, data: UpdateTaskDTO): Promise<Task> {
    const requester = await this.userRepo.findById(data.requesterId);
    if (!requester) throw new NotFoundError("User", data.requesterId);
    const requesterRole = requester.getProps().role;
    
    if (requesterRole === 'CONTRIBUTOR') {
      throw new ValidationError("Only admins, managers, and team leads can modify tasks");
    }

    const task = await this.taskRepo.findById(id);
    if (!task) throw new NotFoundError("Task", id);

    const props = task.getProps();
    const updatedProps = { 
      ...props, 
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : props.deadline 
    };

    // If reassigned to a new owner, check limits for the NEW owner
    if (data.ownerId && data.ownerId !== props.ownerId) {
      const { wipLimit, p1Limit } = await this.getLimits(props.organizationId);
      const activeCount = await this.taskRepo.countActiveByOwner(data.ownerId);
      if (activeCount >= wipLimit) {
        throw new ValidationError(`New owner has reached WIP limit of ${wipLimit}`);
      }
      if ((data.priority || props.priority) === 'P1') {
        const p1Count = await this.taskRepo.countP1ByOwner(data.ownerId);
        if (p1Count >= p1Limit) {
          throw new ValidationError(`New owner has reached P1 limit of ${p1Limit}`);
        }
      }
    } else if (data.priority === 'P1' && props.priority !== 'P1') {
      // If priority upgraded to P1 but owner is the same, check P1 limit for current owner
      const { p1Limit } = await this.getLimits(props.organizationId);
      const p1Count = await this.taskRepo.countP1ByOwner(props.ownerId);
      if (p1Count >= p1Limit) {
        throw new ValidationError(`User has reached P1 limit of ${p1Limit}`);
      }
    }

    const updatedTask = Task.create(updatedProps);
    await this.taskRepo.update(updatedTask);
    return updatedTask;
  }

  public async deleteTask(id: string, requesterId: string): Promise<void> {
    const requester = await this.userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError("User", requesterId);
    const requesterRole = requester.getProps().role;

    if (requesterRole === 'CONTRIBUTOR') {
      throw new ValidationError("Only admins, managers, and team leads can delete tasks");
    }

    const task = await this.taskRepo.findById(id);
    if (!task) throw new NotFoundError("Task", id);

    await this.taskRepo.delete(id);
  }

  public async changeStatus(id: string, newStatus: TaskStatus, reason?: string): Promise<Task> {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new NotFoundError("Task", id);

    const props = task.getProps();
    
    if (newStatus === 'DOING' && props.status !== 'DOING') {
      const { wipLimit } = await this.getLimits(props.organizationId);
      const activeCount = await this.taskRepo.countActiveByOwner(props.ownerId);
      if (activeCount >= wipLimit) {
        throw new ValidationError(`User has reached WIP limit of ${wipLimit}`);
      }
    }

    task.transitionTo(newStatus, reason);
    await this.taskRepo.update(task);
    return task;
  }

  public async listByOwner(ownerId: string, organizationId: string): Promise<Task[]> {
    return this.taskRepo.listByOwner(ownerId, organizationId);
  }

  public async processOverdueTasks(): Promise<number> {
    const now = new Date();
    const allTasks = await this.taskRepo.findAllActive();
    let updatedCount = 0;

    for (const task of allTasks) {
      const props = task.getProps();
      if (props.status !== 'DONE' && props.status !== 'OVERDUE' && props.deadline < now) {
        task.transitionTo('OVERDUE');
        await this.taskRepo.update(task);
        updatedCount++;
      }
    }
    return updatedCount;
  }
}
