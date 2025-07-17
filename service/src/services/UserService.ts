import { injectable } from 'inversify';
import { User } from '../entities/User';
import { DataSource } from 'typeorm';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';
import { IUserService } from './IUserService';

@injectable()
export class UserService implements IUserService {
  private userRepository: UserRepository;

  constructor(dataSource: DataSource) {
    this.userRepository = new UserRepository(dataSource);
  }

  async signup(email: string, password: string, first_name: string, last_name: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error('Email already exists');
    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepository.create({ email, password: hashedPassword, first_name, last_name });
    return this.userRepository.save(user);
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  public async resetPassword(email: string, newPassword: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }
    user.password = await this.hashPassword(newPassword);
    await this.userRepository.save(user);
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
