import { AutoMap } from '@automapper/classes';
import {
  BaseEntity, Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

/**
 * Entity which stores information about owners.
 *
 * Stores total owners information and amount of users in each status.
 * @see {@link UserPopulationStatus}
 */
@Entity('population')
export class Population extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'total_owners' })
  @AutoMap()
    totalOwners: number;

  @Column()
  @AutoMap()
    emperors: number;

  @Column()
  @AutoMap()
    imperialists: number;

  @Column()
  @AutoMap()
    conquerors: number;

  @Column()
  @AutoMap()
    lords: number;

  @Column()
  @AutoMap()
    settlers: number;

  @Column()
  @AutoMap()
    landowners: number;

  @OneToMany(() => User, (user) => user.id)
  @JoinColumn()
    emperorUsers: User[];
}
