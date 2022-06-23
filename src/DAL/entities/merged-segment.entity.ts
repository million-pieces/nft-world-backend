import {
  BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';

import { NftSegment } from './nft-segment.entity';

/**
 * Entity which stores merged-segments.
 * Each merged-segment is union of NFT segments.
 *
 * If user own NFT segments which forms rectangle, he can merge them.
 * On merged segment can be upload new image and set some meta information.
 *
 * @remarks Merged-segments is this projects only structure. It has no representation on blockchain.
 */
@Entity('merged_segment')
export class MergedSegment extends BaseEntity {
  @PrimaryGeneratedColumn()
  @AutoMap()
    id: number;

  @Column({ name: 'image_mini', nullable: true })
  @AutoMap()
    imageMini?: string;

  @Column({ nullable: true })
  @AutoMap()
    image?: string;

  // Meta information which can be set by its owner.

  @Column({ name: 'site_url', nullable: true })
  @AutoMap()
    siteUrl?: string;

  @Column({ name: 'top_left' })
    topLeft: string;

  @Column({ name: 'bottom_right' })
    bottomRight: string;

  @OneToMany(() => NftSegment, (segment) => segment.mergedSegment)
    segments: NftSegment[];
}
