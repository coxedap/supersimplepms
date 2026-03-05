export interface TeamProps {
  id: string;
  name: string;
  leaderId?: string;
  createdAt: Date;
}

export class Team {
  constructor(private readonly props: TeamProps) {}

  public getProps(): TeamProps {
    return { ...this.props };
  }
}
