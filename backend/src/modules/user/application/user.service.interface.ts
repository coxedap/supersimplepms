import { User, UserProps } from "../domain/user.entity";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<void>;
}

export interface UserService {
  getUser(id: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  register(data: { name: string; role: string; team: string }): Promise<User>;
}
