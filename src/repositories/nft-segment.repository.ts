import { EntityRepository, IsNull, Not, Repository } from 'typeorm';

import { NftSegment } from '../DAL/entities/nft-segment.entity';
import { NftSegmentMeta } from '../DAL/entities/nft-segment-meta.entity';

@EntityRepository(NftSegment)
export class NftSegmentRepository extends Repository<NftSegment> {
  async getSegmentsWithCustomImage(): Promise<NftSegment[]> {
    return this.find({ where: { imageMini: Not(IsNull()) }, relations: ['meta'] });
  }

  async getOwnedSegments(): Promise<NftSegment[]> {
    return this.find({ where: { owner: Not(IsNull()) }, relations: ['meta', 'owner', 'owner.civilizationUser'] });
  }

  async getSegmentByCoordinate(coordinates: string): Promise<NftSegment> {
    return this.createQueryBuilder('nft_segment')
      .innerJoinAndMapOne(
        'nft_segment.meta',
        NftSegmentMeta,
        'meta',
        'meta.segment_id = nft_segment.id',
      )
      .leftJoinAndSelect('nft_segment.owner', 'owner')
      .where('nft_segment.coordinates = :coordinates', { coordinates })
      .getOne();
  }

  async getSegmentById(id: number): Promise<NftSegment> {
    return this.createQueryBuilder('nft_segment')
      .innerJoinAndMapOne(
        'nft_segment.meta',
        NftSegmentMeta,
        'meta',
        'meta.segment_id = nft_segment.id',
      )
      .leftJoinAndSelect('nft_segment.owner', 'owner')
      .where('nft_segment.id = :id', { id })
      .getOne();
  }
}
