import {
  BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn,
} from 'typeorm';

import { AutoMap } from '@automapper/classes';

import { MergedSegment } from './merged-segment.entity';
import { NftSegmentMeta } from './nft-segment-meta.entity';

/**
 * Entity which represent real NFTs from ETH blockchain on the server.
 *
 * On each segment can be upload image and some meta information.
 * It will be stored on server. You can't update NFT's meta info on blockchain
 */
@Entity('nft_segment')
export class NftSegment extends BaseEntity {
  @PrimaryColumn({ name: 'id' })
  @AutoMap()
    id: number;

  @Column()
  @AutoMap()
    coordinates: string;

  // Meta information, which can be uploaded by its owner.

  @Column({ name: 'site_url', nullable: true })
  @AutoMap()
    siteUrl?: string;

  @Column({ nullable: true })
  @AutoMap()
    image: string;

  @Column({ name: 'image_mini', nullable: true })
  @AutoMap()
    imageMini?: string;

  // NFT meta information in blockchain. Can't be updated by any sources.

  @OneToOne(() => NftSegmentMeta, (meta) => meta.segment)
    meta: NftSegmentMeta;

  @ManyToOne(() => MergedSegment, (mergedSegment) => mergedSegment.segments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'merged_segment_id' })
    mergedSegment: MergedSegment;
}
