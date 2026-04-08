export type Role = 'CONTRIBUTOR' | 'TEAM_LEAD' | 'MANAGER' | 'ADMIN';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
  team?: string;
  status: string;
  organizationId: string;
  wipLimit: number;
  p1Limit: number;
  wipLimitOverride?: number;
  p1LimitOverride?: number;
}

export class User {
  constructor(private readonly props: UserProps) {}

  public getProps(): UserProps {
    return { ...this.props };
  }
}
