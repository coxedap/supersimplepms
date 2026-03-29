import { User, UserProps } from "../domain/user.entity";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}

export interface UpdateRoleDTO {
  requesterId: string;
  newRole: string;
}

export interface UpdateTeamDTO {
  requesterId: string;
  teamId: string | null;
}

export interface UpdateLimitsDTO {
  requesterId: string;
  wipLimitOverride?: number;
  p1LimitOverride?: number;
}

export interface UpdateStatusDTO {
  requesterId: string;
  status: 'active' | 'inactive';
}

export interface UserService {
  getUser(id: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  register(data: { name: string; role: string; team: string }): Promise<User>;
  updateRole(userId: string, dto: UpdateRoleDTO): Promise<User>;
  updateTeam(userId: string, dto: UpdateTeamDTO): Promise<User>;
  updateLimits(userId: string, dto: UpdateLimitsDTO): Promise<User>;
  updateStatus(userId: string, dto: UpdateStatusDTO): Promise<User>;
}
