import { AutoMap } from '@automapper/classes';
import {
  BaseEntity, Column, Entity, JoinColumn, OneToOne,
} from 'typeorm';

import { User } from './user.entity';

/**
 * Entity which stores user's socials links.
 *
 * @remarks This entity creates only when user's updates himself first time
 */
@Entity('socials')
export class Socials extends BaseEntity {
  @Column({ default: '' })
  @AutoMap()
    facebook: string;

  @Column({ default: '' })
  @AutoMap()
    linkedin: string;

  @Column({ default: '' })
  @AutoMap()
    instagram: string;

  @Column({ default: '' })
  @AutoMap()
    twitter: string;

  @Column({ default: '' })
  @AutoMap()
    discord: string;

  @Column({ default: '' })
  @AutoMap()
    telegram: string;

  @OneToOne(() => User, (user) => user.socials, { primary: true })
  @JoinColumn({ name: 'user_id' })
    user: User;
}
