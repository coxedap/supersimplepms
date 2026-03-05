export interface ProjectProps {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  status: 'active' | 'archived' | 'completed';
  createdAt: Date;
}

export class Project {
  constructor(private readonly props: ProjectProps) {}

  public getProps(): ProjectProps {
    return { ...this.props };
  }
}
