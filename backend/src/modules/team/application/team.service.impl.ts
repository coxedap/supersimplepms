import { Team } from "../domain/team.entity";
import { CreateTeamDTO, UpdateTeamDTO, TeamRepository, TeamService, AddMemberDTO, RemoveMemberDTO } from "./team.service.interface";
import { NotFoundError, ValidationError } from "../../../shared/errors/base.errors";

export class TeamServiceImpl implements TeamService {
  constructor(
    private readonly teamRepo: TeamRepository,
    private readonly userRepo: any
  ) {}

  public async createTeam(data: CreateTeamDTO): Promise<Team> {
    const creator = await this.userRepo.findById(data.creatorId);
    if (!creator || (creator.getProps().role !== 'ADMIN' && creator.getProps().role !== 'MANAGER')) {
      throw new ValidationError("Only admins and managers can create teams");
    }

    if (data.leaderId) {
      const leader = await this.userRepo.findById(data.leaderId);
      if (!leader) throw new NotFoundError("Leader", data.leaderId);
    }

    const team = new Team({
      id: crypto.randomUUID(),
      name: data.name,
      leaderId: data.leaderId,
      createdAt: new Date()
    });

    await this.teamRepo.save(team);
    return team;
  }

  public async updateTeam(id: string, data: UpdateTeamDTO): Promise<Team> {
    const requester = await this.userRepo.findById(data.requesterId);
    if (!requester) throw new NotFoundError("User", data.requesterId);
    const requesterRole = requester.getProps().role;

    if (requesterRole !== 'ADMIN' && requesterRole !== 'MANAGER') {
      throw new ValidationError("Only admins and managers can edit teams");
    }

    const team = await this.teamRepo.findById(id);
    if (!team) throw new NotFoundError("Team", id);

    if (data.leaderId !== undefined) {
      if (data.leaderId !== null) {
        const leader = await this.userRepo.findById(data.leaderId);
        if (!leader) throw new NotFoundError("Leader", data.leaderId);
      }
    }

    const current = team.getProps();
    const updated = new Team({
      id: current.id,
      name: data.name ?? current.name,
      leaderId: data.leaderId !== undefined ? (data.leaderId ?? undefined) : current.leaderId,
      createdAt: current.createdAt,
    });

    await this.teamRepo.update(updated);
    return updated;
  }

  public async addMember(data: AddMemberDTO): Promise<void> {
    const requester = await this.userRepo.findById(data.requesterId);
    if (!requester) throw new NotFoundError("User", data.requesterId);
    const requesterRole = requester.getProps().role;

    if (requesterRole !== 'ADMIN' && requesterRole !== 'MANAGER' && requesterRole !== 'TEAM_LEAD') {
      throw new ValidationError("Only admins, managers, and team leads can add members to a team");
    }

    const team = await this.teamRepo.findById(data.teamId);
    if (!team) throw new NotFoundError("Team", data.teamId);

    if (requesterRole === 'TEAM_LEAD' && team.getProps().leaderId !== data.requesterId) {
      throw new ValidationError("Only the team leader or admin can add members to this team");
    }

    const userToAdd = await this.userRepo.findById(data.userId);
    if (!userToAdd) throw new NotFoundError("User", data.userId);

    await this.teamRepo.addMember(data.teamId, data.userId);
  }

  public async removeMember(data: RemoveMemberDTO): Promise<void> {
    const requester = await this.userRepo.findById(data.requesterId);
    if (!requester) throw new NotFoundError("User", data.requesterId);
    const requesterRole = requester.getProps().role;

    if (requesterRole !== 'ADMIN' && requesterRole !== 'MANAGER' && requesterRole !== 'TEAM_LEAD') {
      throw new ValidationError("Only admins, managers, and team leads can remove members");
    }

    const team = await this.teamRepo.findById(data.teamId);
    if (!team) throw new NotFoundError("Team", data.teamId);

    if (requesterRole === 'TEAM_LEAD' && team.getProps().leaderId !== data.requesterId) {
      throw new ValidationError("Only the team leader or admin can remove members from this team");
    }

    await this.teamRepo.removeMember(data.teamId, data.userId);
  }

  public async getTeam(id: string): Promise<Team> {
    const team = await this.teamRepo.findById(id);
    if (!team) throw new NotFoundError("Team", id);
    return team;
  }

  public async getAllTeams(): Promise<Team[]> {
    return this.teamRepo.findAll();
  }
}
