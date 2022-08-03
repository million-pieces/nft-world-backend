import { EntityRepository, Repository } from 'typeorm';
import moment from 'moment';

import { NftSegment } from '../../DAL/entities/nft-segment.entity';
import { CivilizationSegment } from '../../DAL/entities/civilization-game/civilization-segments.entity';

@EntityRepository(CivilizationSegment)
export class CivilizationSegmentRepository extends Repository<CivilizationSegment> {
  async createSegment(nftSegment: NftSegment): Promise<CivilizationSegment> {
    const lastOwnerPaymentDate = moment(Date.now()).subtract(1, 'day').toDate();

    return this.create({ segment: nftSegment, caves: [], lastOwnerPaymentDate }).save();
  }

  async getSegmentByCoordinate(coordinates: string): Promise<CivilizationSegment> {
    return this.findOne({
      where: {
        segment: {
          coordinates,
        },
      },

      relations: ['caves', 'segment', 'caves.caveCitizens', 'segment.meta', 'segment.owner'],
    });
  }

  async getSegmentById(id: number): Promise<CivilizationSegment> {
    return this.findOne({
      where: {
        id,
      },

      relations: ['caves', 'segment', 'caves.caveCitizens', 'segment.meta', 'segment.owner'],
    });
  }

  async getSegmentsByOwner(walletAddress: string): Promise<CivilizationSegment[]> {
    return this.find({
      where: {
        segment: {
          owner: {
            walletAddress,
          },
        },
      },

      relations: ['caves', 'segment', 'caves.caveCitizens', 'segment.meta', 'segment.owner'],
    });
  }
}
