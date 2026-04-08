import { Project } from "../domain/project.entity";

export interface CreateProjectDTO {
  name: string;
  description?: string;
  managerId: string;
  teamId?: string;
  creatorId: string;
  organizationId: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  managerId?: string;
  teamId?: string | null;
  status?: 'active' | 'archived' | 'completed';
  requesterId: string;
}

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
  findAll(organizationId: string): Promise<Project[]>;
}

export interface ProjectService {
  createProject(data: CreateProjectDTO): Promise<Project>;
  updateProject(id: string, data: UpdateProjectDTO): Promise<Project>;
  getProject(id: string): Promise<Project>;
  getAllProjects(organizationId: string): Promise<Project[]>;
}
