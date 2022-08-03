import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CivilizationCaveCitizens } from './civilization-cave-citizens.entity';

import { CivilizationSegment } from './civilization-segments.entity';

@Entity('Civilization_Cave')
export class CivilizationCave extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @ManyToOne(() => CivilizationSegment, (segment) => segment.caves)
    segment: CivilizationSegment;

  @OneToMany(() => CivilizationCaveCitizens, (caveCitizens) => caveCitizens.cave)
    caveCitizens: CivilizationCaveCitizens[];

  @Column()
    position: number;
}
