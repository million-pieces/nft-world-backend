import { EntityRepository, getRepository, Repository } from 'typeorm';

import { User } from '../DAL/entities/user.entity';
import { Socials } from '../DAL/entities/socials.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(walletAddress: string): Promise<User> {
    const socials = getRepository(Socials).create();
    const user = await this.create({ walletAddress, socials }).save();

    socials.user = user;
    await getRepository(Socials).save(socials);

    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User> {
    return this.findOne({
      where: { walletAddress },
      relations: ['socials'],
    });
  }
}
