import { User } from '../entities/User';

export interface IUserService {
  signup(username: string, password: string): Promise<User>;
  login(username: string, password: string): Promise<User | null>;
}
