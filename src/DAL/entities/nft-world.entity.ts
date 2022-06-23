import {
  BaseEntity, Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Entity which stores information about total price of all NFT segments.
 */
@Entity('nft_world')
export class NftWorld extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    value: number;

  @Column()
    date: Date;
}
