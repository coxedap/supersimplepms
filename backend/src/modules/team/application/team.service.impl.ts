import { Team } from "../domain/team.entity";
import { CreateTeamDTO, TeamRepository, TeamService, AddMemberDTO } from "./team.service.interface";
import { NotFoundError, ValidationError } from "../../../shared/errors/base.errors";

export class TeamServiceImpl implements TeamService {
  constructor(
    private readonly teamRepo: TeamRepository,
    private readonly userRepo: any
  ) {}

  public async createTeam(data: CreateTeamDTO): Promise<Team> {
    const creator = await this.userRepo.findById(data.creatorId);
    if (!creator || creator.getProps().role !== 'ADMIN') {
      throw new ValidationError("Only admins can create teams");
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

  public async addMember(data: AddMemberDTO): Promise<void> {
    const requester = await this.userRepo.findById(data.requesterId);
    if (!requester) throw new NotFoundError("User", data.requesterId);
    const requesterRole = requester.getProps().role;

    if (requesterRole !== 'ADMIN' && requesterRole !== 'TEAM_LEAD') {
      throw new ValidationError("Only admins and team leads can add members to a team");
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

  public async getTeam(id: string): Promise<Team> {
    const team = await this.teamRepo.findById(id);
    if (!team) throw new NotFoundError("Team", id);
    return team;
  }

  public async getAllTeams(): Promise<Team[]> {
    return this.teamRepo.findAll();
  }
}
