import { User, UserProps } from "../domain/user.entity";
import { UserRepository, UserService } from "./user.service.interface";
import { NotFoundError } from "../../../shared/errors/base.errors";

export class UserServiceImpl implements UserService {
  constructor(private readonly userRepo: UserRepository) {}

  public async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("User", id);
    return user;
  }

  public async getAllUsers(): Promise<User[] | any> {
    return this.userRepo.findAll();
  }

  public async register(data: { name: string; role: string; team?: string }): Promise<User> {
    const user = new User({
      id: crypto.randomUUID(),
      name: data.name,
      role: data.role as any,
      status: 'active',
      wipLimit: 3,
      p1Limit: 1
    });
    await this.userRepo.save(user);
    return user;
  }
}
