import { EntityRepository, Repository } from 'typeorm';

import { CivilizationSegment } from '../../DAL/entities/civilization-game/civilization-segments.entity';
import { CivilizationCave } from '../../DAL/entities/civilization-game/civilization-cave.entity';

@EntityRepository(CivilizationCave)
export class CivilizationCaveRepository extends Repository<CivilizationCave> {
  async createCave(segment: CivilizationSegment, position: number): Promise<CivilizationCave> {
    return this.create({ segment, position }).save();
  }

  async getCaveById(caveId: number): Promise<CivilizationCave> {
    return this.findOne({ where: { id: caveId } });
  }
}
