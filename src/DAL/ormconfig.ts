import { ConnectionOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { LandsForSale } from './entities/lands-for-sale.entity';
import { MergedSegment } from './entities/merged-segment.entity';
import { NftSegmentMeta } from './entities/nft-segment-meta.entity';
import { NftSegment } from './entities/nft-segment.entity';
import { NftWorld } from './entities/nft-world.entity';
import { Population } from './entities/population.entity';
import { SegmentImageLog } from './entities/segment-image-log.entity';
import { Socials } from './entities/socials.entity';
import { User } from './entities/user.entity';
import { CivilizationCave } from './entities/civilization-game/civilization-cave.entity';
import { CivilizationCaveCitizens } from './entities/civilization-game/civilization-cave-citizens.entity';
import { CivilizationUser } from './entities/civilization-game/civilization-user.entity';
import { CivilizationSegment } from './entities/civilization-game/civilization-segments.entity';

dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

/**
 * This postgres config for typeORM uses only for migrations
 */
const ormconfig: ConnectionOptions = {
  name: 'default',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    LandsForSale,
    MergedSegment,
    NftSegmentMeta,
    NftSegment,
    NftWorld,
    Population,
    SegmentImageLog,
    Socials,
    User,
    CivilizationCave,
    CivilizationCaveCitizens,
    CivilizationUser,
    CivilizationSegment,
  ],
  migrations: ['src/DAL/migrations/*.*'],
  cli: {
    migrationsDir: 'src/DAL/migrations',
  },
  synchronize: false,
};

export = ormconfig;
