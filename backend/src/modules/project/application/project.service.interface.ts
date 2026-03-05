import { Project } from "../domain/project.entity";

export interface CreateProjectDTO {
  name: string;
  description?: string;
  managerId: string;
  creatorId: string; // must be ADMIN or MANAGER
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  managerId?: string;
  status?: 'active' | 'archived' | 'completed';
  requesterId: string; // must be ADMIN or MANAGER
}

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
  findAll(): Promise<Project[]>;
}

export interface ProjectService {
  createProject(data: CreateProjectDTO): Promise<Project>;
  updateProject(id: string, data: UpdateProjectDTO): Promise<Project>;
  getProject(id: string): Promise<Project>;
  getAllProjects(): Promise<Project[]>;
}
