/* eslint-disable max-len */
import moment from 'moment';
import { CivilizationCave } from 'src/DAL/entities/civilization-game/civilization-cave.entity';
import { EntityRepository, Repository } from 'typeorm';

import { CivilizationCaveCitizens } from '../../DAL/entities/civilization-game/civilization-cave-citizens.entity';
import { CivilizationUser } from '../../DAL/entities/civilization-game/civilization-user.entity';

@EntityRepository(CivilizationCaveCitizens)
export class CivilizationCaveCitizenRepository extends Repository<CivilizationCaveCitizens> {
  async createCaveCitizens(cave: CivilizationCave, citizen: CivilizationUser, nftId: number, image: string): Promise<CivilizationCaveCitizens> {
    const lastCitizenPaymentDate = moment().subtract(1, 'day').toDate();
    const lastRevenueCollectionDate = moment().subtract(1, 'day').toDate();

    return this.create({
      cave,
      citizen,
      nftId,
      nftImage: image,
      lastCitizenPaymentDate,
      lastRevenueCollectionDate,
    }).save();
  }

  async getCitizenByCaveId(caveId: number): Promise<CivilizationUser> {
    const { citizen } = await this.findOne({
      relations: ['cave', 'citizen', 'cave.user'],
      where: {
        cave: {
          id: caveId,
        },
      },
    });

    return citizen;
  }

  async getCivilizationCaveCitizensByCaveId(caveId: number): Promise<CivilizationCaveCitizens[]> {
    return this.find({
      where: {
        cave: {
          id: caveId,
        },
      },

      relations: ['citizen', 'citizen.user', 'cave', 'cave.segment'],
    });
  }

  async getCivilizationCavesByWalletAddress(walletAddress: string): Promise<CivilizationCaveCitizens[]> {
    return this.find({
      where: {
        citizen: {
          user: {
            walletAddress,
          },
        },
      },

      relations: ['citizen', 'citizen.user', 'cave', 'cave.segment'],
    });
  }

  async getCivilizationCavesByNftId(nftId: number): Promise<CivilizationCaveCitizens> {
    return this.findOne({
      where: {
        nftId,
      },

      relations: ['citizen', 'citizen.user', 'cave', 'cave.segment'],
    });
  }
}
