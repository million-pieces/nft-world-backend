import { EntityRepository, Repository } from 'typeorm';

import { Population } from '../DAL/entities/population.entity';

@EntityRepository(Population)
export class PopulationRepository extends Repository<Population> {
  async clear(): Promise<void> {
    const population = await this.find();

    await this.remove(population);
  }
}
