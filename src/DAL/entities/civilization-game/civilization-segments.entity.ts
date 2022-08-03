import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { NftSegment } from '../nft-segment.entity';
import { CivilizationCave } from './civilization-cave.entity';

@Entity('Civilization_Segment')
export class CivilizationSegment extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @OneToOne(() => NftSegment, (segment) => segment.civilizationSegment)
  @JoinColumn({ name: 'segment_id' })
    segment: NftSegment;

  @OneToMany(() => CivilizationCave, (cave) => cave.segment)
    caves: CivilizationCave[];

  @Column({ nullable: true, name: 'last_owner_payment_date' })
    lastOwnerPaymentDate: Date;
}
