import { EntityRepository, Repository } from 'typeorm';

import { ColorUtil } from '../../infrastructure/utils/color.util';

import { User } from '../../DAL/entities/user.entity';
import { CivilizationUser } from '../../DAL/entities/civilization-game/civilization-user.entity';
import { CivilizationUserRole } from '../../infrastructure/config/enum/civilization-user-role.enum';

@EntityRepository(CivilizationUser)
export class CivilizationUserRepository extends Repository<CivilizationUser> {
  async createUser(user: User): Promise<CivilizationUser> {
    const color = ColorUtil.generateColorByString(user.walletAddress);

    return this.create({ user, role: CivilizationUserRole.CITIZEN, color }).save();
  }

  async getUserByWalletAddress(walletAddress: string): Promise<CivilizationUser> {
    return this.findOne({
      relations: ['user'],

      where: {
        user: {
          walletAddress,
        },
      },
    });
  }
}
