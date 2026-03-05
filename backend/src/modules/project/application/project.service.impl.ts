import { Project, ProjectProps } from "../domain/project.entity";
import { CreateProjectDTO, ProjectRepository, ProjectService, UpdateProjectDTO } from "./project.service.interface";
import { NotFoundError, ValidationError } from "../../../shared/errors/base.errors";

export class ProjectServiceImpl implements ProjectService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly userRepo: any
  ) {}

  public async createProject(data: CreateProjectDTO): Promise<Project> {
    const creator = await this.userRepo.findById(data.creatorId);
    if (!creator) throw new NotFoundError("Creator", data.creatorId);
    if (creator.getProps().role !== 'ADMIN' && creator.getProps().role !== 'MANAGER') {
      throw new ValidationError("Only admins and managers can create projects");
    }

    const manager = await this.userRepo.findById(data.managerId);
    if (!manager) throw new NotFoundError("Manager", data.managerId);

    const project = new Project({
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      managerId: data.managerId,
      status: 'active',
      createdAt: new Date()
    });

    await this.projectRepo.save(project);
    return project;
  }

  public async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
    const requester = await this.userRepo.findById(data.requesterId);
    if (!requester || (requester.getProps().role !== 'ADMIN' && requester.getProps().role !== 'MANAGER')) {
      throw new ValidationError("Only admins and managers can modify projects");
    }

    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundError("Project", id);

    const props = project.getProps();
    const updatedProject = new Project({
      ...props,
      ...data,
      managerId: data.managerId || props.managerId,
      status: data.status || props.status,
    });

    await this.projectRepo.update(updatedProject);
    return updatedProject;
  }

  public async getProject(id: string): Promise<Project> {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundError("Project", id);
    return project;
  }

  public async getAllProjects(): Promise<Project[]> {
    return this.projectRepo.findAll();
  }
}
