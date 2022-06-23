import {
  BaseEntity, Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Entity which stores info about sales orders from {@link https://opensea.io/ OpenSea}
 *
 * This information recalculates everyday at 12:00 UTC by CronService
 */
@Entity('lands_for_sale')
export class LandsForSale extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    country: string;

  @Column()
    coordinates: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
    price: number;

  @Column()
    link: string;

  @Column()
    picture: string;
}
