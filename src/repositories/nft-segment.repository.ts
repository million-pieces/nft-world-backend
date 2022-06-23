import { EntityRepository, IsNull, Not, Repository } from 'typeorm';

import { NftSegment } from '../DAL/entities/nft-segment.entity';
import { NftSegmentMeta } from '../DAL/entities/nft-segment-meta.entity';

@EntityRepository(NftSegment)
export class NftSegmentRepository extends Repository<NftSegment> {
  async getSegmentsWithCustomImage(): Promise<NftSegment[]> {
    return this.find({ where: { imageMini: Not(IsNull()) }, relations: ['meta'] });
  }

  async getSegmentByCoordinate(coordinates: string): Promise<NftSegment> {
    return this.createQueryBuilder('nft_segment')
      .innerJoinAndMapOne(
        'nft_segment.meta',
        NftSegmentMeta,
        'meta',
        'meta.segment_id = nft_segment.id',
      )
      .where('nft_segment.coordinates = :coordinates', { coordinates })
      .getOne();
  }
}
