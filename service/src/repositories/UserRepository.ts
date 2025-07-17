import { User } from '../entities/User';
import { DataSource, Repository } from 'typeorm';

export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.findOne({ where: { email } });
    return user === null ? undefined : user;
  }

  async resetPassword(email: string, newPassword: string): Promise<User | null> {
    const user = await this.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    user.password = newPassword;
    await this.save(user);
    return user;
  }
}
