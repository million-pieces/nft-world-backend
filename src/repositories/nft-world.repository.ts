import { Between, EntityRepository, Repository } from 'typeorm';

import moment from 'moment';

import { NftWorld } from '../DAL/entities/nft-world.entity';

@EntityRepository(NftWorld)
export class NftWorldRepository extends Repository<NftWorld> {
  createNftWorld(value: number): Promise<NftWorld> {
    return this.create({ value, date: new Date() }).save();
  }

  getLatestValue(): Promise<NftWorld> {
    return this.findOne({
      order: {
        date: 'DESC',
      },
    });
  }

  getYesterdayValue(): Promise<NftWorld> {
    const yesterdayDate = moment(Date.now()).subtract(1, 'day').format('YYYY-MM-DD');

    return this.findOne({
      where: {
        date: Between(
          new Date(`${yesterdayDate}T00:00:00.000`),
          new Date(`${yesterdayDate}T23:59:59.999`),
        ),
      },
    });
  }

  getWeekAgoValue(): Promise<NftWorld> {
    const weekAgoDate = moment(Date.now()).subtract(1, 'week').format('YYYY-MM-DD');

    return this.findOne({
      where: {
        date: Between(
          new Date(`${weekAgoDate}T00:00:00.000`),
          new Date(`${weekAgoDate}T23:59:59.999`),
        ),
      },
    });
  }
}
