import { Team } from "../domain/team.entity";

export interface CreateTeamDTO {
  name: string;
  leaderId?: string;
  creatorId: string; // must be ADMIN
}

export interface AddMemberDTO {
  userId: string;
  teamId: string;
  requesterId: string; // must be ADMIN or TEAM_LEAD of this team
}

export interface TeamRepository {
  findById(id: string): Promise<Team | null>;
  save(team: Team): Promise<void>;
  update(team: Team): Promise<void>;
  findAll(): Promise<Team[]>;
  addMember(teamId: string, userId: string): Promise<void>;
  removeMember(teamId: string, userId: string): Promise<void>;
}

export interface TeamService {
  createTeam(data: CreateTeamDTO): Promise<Team>;
  addMember(data: AddMemberDTO): Promise<void>;
  getTeam(id: string): Promise<Team>;
  getAllTeams(): Promise<Team[]>;
}
