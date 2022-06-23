import { AutoMap } from '@automapper/classes';
import {
  BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

import { NftSegment } from './nft-segment.entity';

import { SegmentImageLogAction } from '../../infrastructure/config/enum/segment-image-log-action.enum';

/**
 * Entity which stores logs.
 *
 * @remarks Currently has four types of logs:
 * * MERGE - on merge some NFT segments in one
 * * UNMERGE - unmerge segment to pieces
 * * UPLOAD - upload image on segment or merged-segment
 * * CLAIM (deprecated) - claim NFT segments from airdrop
 *
 * @see {@link SegmentImageLogAction}
 */
@Entity('segment_image_log')
export class SegmentImageLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  @AutoMap()
    id: number;

  @Column({ nullable: true })
  @AutoMap()
    image?: string;

  @Column({ enum: SegmentImageLogAction })
  @AutoMap()
    action: SegmentImageLogAction;

  @Column({ name: 'wallet_address', nullable: true })
  @AutoMap()
    walletAddress: string;

  @ManyToMany(() => NftSegment, (segment) => segment.id)
  @AutoMap()
  @JoinTable()
    segments: NftSegment[];

  @CreateDateColumn()
  @AutoMap()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}
