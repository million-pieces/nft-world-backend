/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */
import { EntityRepository, getRepository, In, Repository } from 'typeorm';

import { NftSegment } from '../DAL/entities/nft-segment.entity';
import { MergedSegment } from '../DAL/entities/merged-segment.entity';

@EntityRepository(MergedSegment)
export class MergedSegmentRepository extends Repository<MergedSegment> {
  async createMergedSegment(coordinates: string[]): Promise<MergedSegment> {
    coordinates.sort();

    const mergedSegment = this.create();

    mergedSegment.topLeft = coordinates[0];
    mergedSegment.bottomRight = coordinates[coordinates.length - 1];

    mergedSegment.segments = await getRepository(NftSegment).find({
      where: { coordinates: In(coordinates) },
    });

    await mergedSegment.save();
    return mergedSegment;
  }

  async getMergedSegments(): Promise<MergedSegment[]> {
    return this.createQueryBuilder('merged_segments')
      .innerJoinAndMapMany(
        'merged_segments.segments',
        NftSegment,
        'segments',
        'segments.merged_segment_id = merged_segments.id',
      )
      .getMany();
  }

  async getLargestMergedSegments(limit: number = 20, offset: number = 0): Promise<MergedSegment[]> {
    return this.createQueryBuilder('merged_segments')
      .leftJoinAndSelect('merged_segments.segments', 'segments')
      .addSelect((subQuery) => subQuery
        .select('COUNT(segment.id)', 'count')
        .from(NftSegment, 'segment')
        .where('segment.merged_segment_id = merged_segments.id'), 'count')
      .orderBy('count', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }

  async getMergedSegmentById(id: number): Promise<MergedSegment> {
    return this.createQueryBuilder('merged_segments')
      .innerJoinAndMapMany(
        'merged_segments.segments',
        NftSegment,
        'segments',
        'segments.merged_segment_id = merged_segments.id',
      )
      .where('merged_segments.id = :id', { id })
      .getOne();
  }
}
