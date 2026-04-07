export interface ProjectProps {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  teamId?: string;
  status: 'active' | 'archived' | 'completed';
  organizationId: string;
  createdAt: Date;
}

export class Project {
  constructor(private readonly props: ProjectProps) {}

  public getProps(): ProjectProps {
    return { ...this.props };
  }
}
