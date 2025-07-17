import { User } from '../entities/User';

export interface IUserService {
  signup(email: string, password: string, first_name: string, last_name: string): Promise<User>;
  login(email: string, password: string): Promise<User | null>;
  resetPassword(email: string, newPassword: string): Promise<User | null>;
}
