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

  async signup(username: string, password: string): Promise<User> {
    const existing = await this.userRepository.findByUsername(username);
    if (existing) throw new Error('Username already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ username, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async login(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }
}
