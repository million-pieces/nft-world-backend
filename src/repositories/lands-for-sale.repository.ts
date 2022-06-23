import { EntityRepository, Repository } from 'typeorm';

import { LandsForSale } from '../DAL/entities/lands-for-sale.entity';
import { LandsForSaleDto } from '../dto/stats/lands-for-sale.dto';

@EntityRepository(LandsForSale)
export class LandsForSaleRepository extends Repository<LandsForSale> {
  createLandForSale(props: LandsForSaleDto): Promise<LandsForSale> {
    return this.create(props).save();
  }
}
