import {
  BaseEntity, Column, Entity, JoinColumn, OneToOne,
} from 'typeorm';

import { NftSegment } from './nft-segment.entity';

/**
 * NFT segment meta from blockchain.
 * It cant be updated by any sources.
 */
@Entity('nft_segment_meta')
export class NftSegmentMeta extends BaseEntity {
  @Column()
    country: string;

  @Column()
    artwork: string;

  @Column()
    image: string;

  @OneToOne(() => NftSegment, (segment) => segment.meta, { onDelete: 'CASCADE', primary: true })
  @JoinColumn({ name: 'segment_id' })
    segment: NftSegment;
}
