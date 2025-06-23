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
}
