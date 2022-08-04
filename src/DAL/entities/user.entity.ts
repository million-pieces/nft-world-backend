import { AutoMap } from '@automapper/classes';
import {
  BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

import { Population } from './population.entity';
import { Socials } from './socials.entity';
import { CivilizationUser } from './civilization-game/civilization-user.entity';
import { NftSegment } from './nft-segment.entity';

/**
 * Entity which stores user's info
 *
 * @remarks This entity creates only when user's updates himself first time
 */
@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ default: '' })
  @AutoMap()
    avatar: string;

  @Column({ default: '' })
  @AutoMap()
    username: string;

  @Column({ name: 'wallet_address', default: '' })
    walletAddress: string;

  @Column({ default: 0 })
    nonce: number;

  @Column({ name: 'claimable_tokens', default: 0 })
    claimableTokens: number;

  @Column({ name: 'piece_balance', default: 0 })
    pieceBalance: number;

  @OneToOne(() => Socials, (socials) => socials.user, { cascade: true })
    socials: Socials;

  @OneToMany(() => NftSegment, (segment) => segment.owner)
    segments: NftSegment[];

  @ManyToOne(() => Population, (population) => population.id, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'population_id' })
    population: Population;

  @OneToOne(() => CivilizationUser, (civUser) => civUser.user)
    civilizationUser: CivilizationUser;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}
