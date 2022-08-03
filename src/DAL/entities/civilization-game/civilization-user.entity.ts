import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CivilizationUserRole } from '../../../infrastructure/config/enum/civilization-user-role.enum';

import { User } from '../user.entity';
import { CivilizationCaveCitizens } from './civilization-cave-citizens.entity';

@Entity('Civilization_User')
export class CivilizationUser extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @OneToOne(() => User, (user) => user.civilizationUser)
  @JoinColumn({ name: 'user_id' })
    user: User;

  @OneToMany(() => CivilizationCaveCitizens, (caveCitizens) => caveCitizens.citizen)
    caveCitizens: CivilizationCaveCitizens[];

  @Column({ nullable: true, enum: CivilizationUserRole, default: null })
    role: CivilizationUserRole;

  @Column()
    color: string;

  @Column({ default: 0 })
    balance: number;
}
