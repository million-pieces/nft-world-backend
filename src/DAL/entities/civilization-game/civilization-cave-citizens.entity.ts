import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CivilizationCave } from './civilization-cave.entity';
import { CivilizationUser } from './civilization-user.entity';

@Entity('Civilization_Cave_Citizens')
export class CivilizationCaveCitizens extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'nft_id' })
    nftId: number;

  @Column({ name: 'nft_image' })
    nftImage: string;

  @ManyToOne(() => CivilizationCave, (cave) => cave.caveCitizens)
    cave: CivilizationCave;

  @ManyToOne(() => CivilizationUser, (user) => user.caveCitizens)
    citizen: CivilizationUser;

  @Column({ name: 'last_citizen_payment_date' })
    lastCitizenPaymentDate: Date;

  @Column({ name: 'last_revenue_collection_date' })
    lastRevenueCollectionDate: Date;
}
