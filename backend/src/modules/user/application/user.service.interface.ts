import { User } from "../domain/user.entity";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  findAll(organizationId: string): Promise<User[]>;
  save(user: User, passwordHash: string): Promise<void>;
  update(user: User): Promise<void>;
  delete(userId: string): Promise<void>;
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

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

/** ADMIN only: creates an inactive user directly in the org */
export interface AddMemberDTO {
  email: string;
  role: string;
  organizationId: string;
  requesterId: string;
}

/** Inactive user sets their name + password to activate their account */
export interface SetupPasswordDTO {
  email: string;
  name: string;
  password: string;
}

/** Creates an invite record and sends an email link — no password set yet */
export interface InviteMemberDTO {
  email: string;
  role: string;
  organizationId: string;
  requesterId: string;
}

/** Accepts an invite link — user supplies their name and password */
export interface AcceptInviteDTO {
  token: string;
  name: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserService {
  getUser(id: string): Promise<User>;
  getAllUsers(organizationId: string): Promise<User[]>;
  login(dto: LoginDTO): Promise<User>;
  register(dto: RegisterDTO): Promise<User>;
  addMember(dto: AddMemberDTO): Promise<void>;
  deleteMember(userId: string, requesterId: string): Promise<void>;
  setupPassword(dto: SetupPasswordDTO): Promise<import('../domain/user.entity').User>;
  inviteMember(dto: InviteMemberDTO): Promise<void>;
  acceptInvite(dto: AcceptInviteDTO): Promise<User>;
  updateRole(userId: string, dto: UpdateRoleDTO): Promise<User>;
  updateTeam(userId: string, dto: UpdateTeamDTO): Promise<User>;
  updateLimits(userId: string, dto: UpdateLimitsDTO): Promise<User>;
  updateStatus(userId: string, dto: UpdateStatusDTO): Promise<User>;
}
