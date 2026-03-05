import { Task, TaskProps, TaskStatus, Priority } from "../domain/task.entity";

export interface CreateTaskDTO {
  title: string;
  description?: string;
  creatorId: string; // ADMIN, MANAGER, or TEAM_LEAD
  ownerId: string;   // The user assigned to the task
  projectId?: string;
  priority: Priority;
  deadline: Date;
  estimatedEffort: number;
}

export interface UpdateTaskDTO {
  requesterId: string; // ADMIN, MANAGER, or TEAM_LEAD
  title?: string;
  description?: string;
  ownerId?: string;
  projectId?: string;
  priority?: Priority;
  deadline?: Date;
  estimatedEffort?: number;
}

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  listByOwner(ownerId: string): Promise<Task[]>;
  findAllActive(): Promise<Task[]>;
  countActiveByOwner(ownerId: string): Promise<number>;
  countP1ByOwner(ownerId: string): Promise<number>;
}

export interface TaskService {
  createTask(data: CreateTaskDTO): Promise<Task>;
  updateTask(id: string, data: UpdateTaskDTO): Promise<Task>;
  changeStatus(id: string, newStatus: TaskStatus, reason?: string): Promise<Task>;
  listByOwner(ownerId: string): Promise<Task[]>;
  deleteTask(id: string, requesterId: string): Promise<void>;
}
