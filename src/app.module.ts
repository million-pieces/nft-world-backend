import { Module, ValidationPipe, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CommandModule } from 'nestjs-command';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { MapProfile } from './infrastructure/mapper.profile';

import { NftSegmentController } from './controllers/nft-segment.controller';
import { NftSegmentRepository } from './repositories/nft-segment.repository';
import { NftSegmentService } from './services/nft-segment.service';
import { NftMetadataController } from './controllers/nft-metadata.controller';

import { MergedSegmentRepository } from './repositories/merged-segment.repository';
import { MergedSegmentService } from './services/merged-segment.service';
import { MergedSegmentController } from './controllers/merged-segment.controller';

import { MongoDBMigration } from './DAL/mongodb-migration/mongodb-migration.command';

import { ApiConfigModule } from './infrastructure/config/api-config.module';
import { ApiConfigService } from './infrastructure/config/api-config.service';

import { SegmentLoggerService } from './services/segment-logger.service';
import { SegmentImageLogRepository } from './repositories/segment-image-log.repository';
import { SegmentLoggerController } from './controllers/segment-logger.controller';

import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user.repository';

import { ShellCommandUtil } from './infrastructure/utils/shell-commands.util';

import { HttpExceptionFilter } from './infrastructure/middlewares/filters/http-exception.filter';
import { ApiResponseInterceptor } from './infrastructure/middlewares/interceptors/api-response.interceptor';

import { GraphQLService } from './services/graphQL.service';

import { StatsService } from './services/stats.service';
import { StatsController } from './controllers/stats.controller';
import { PopulationRepository } from './repositories/population.repository';

import { NftWorldRepository } from './repositories/nft-world.repository';
import { OpenSeaService } from './services/opensea.service';
import { CronService } from './services/cron.service';
import { LandsForSaleRepository } from './repositories/lands-for-sale.repository';

import { Base64ToFiles } from './infrastructure/utils/scripts/base64-to-file.command';
import { LogImagesExtName } from './infrastructure/utils/scripts/log-images-extname.command';
import { RemoveNonExistingFiles } from './infrastructure/utils/scripts/remove-non-existing-files.command';
import { PullNftOwners } from './infrastructure/utils/scripts/pull-nft-owners.command';

import { CivilizationSegmentRepository } from './repositories/civilization-game/civilization-segment-repository';
import { CivilizationMapController } from './controllers/civilization-game/civilization-map.cotroller';
import { CivilizationCavesService } from './services/civilization-game/civilization-caves.service';
import { CivilizationMapService } from './services/civilization-game/civilization-map.service';
import { CivilizationSegmentService } from './services/civilization-game/civilization-segment.service';
import { CivilizationCaveCitizenRepository } from './repositories/civilization-game/civilization-cave-citizen.repository';
import { CivilizationCaveRepository } from './repositories/civilization-game/civilization-cave.repository';
import { CivilizationUserRepository } from './repositories/civilization-game/civilization-user-repository';
import { CivilizationCavesController } from './controllers/civilization-game/civilization-caves.controller';
import { CivilizationUserService } from './services/civilization-game/civilization-user.service';
import { CivilizationSegmentController } from './controllers/civilization-game/civilization-segments.controller';
import { CivilizationUserController } from './controllers/civilization-game/civilization-user.controller';
import { CivilizationMetadataController } from './controllers/civilization-game/civilization-metadata.controller';
import { CivilizationMetadataService } from './services/civilization-game/civilization-metadata.service';
import { CivilizationClaimController } from './controllers/civilization-game/civilization-claim.controller';
import { CivilizationClaimService } from './services/civilization-game/civilization-claim.service';
import { CivilizationGraphService } from './services/civilization-game/civilization-graph.service';
import { CivilizationCitizensService } from './services/civilization-game/civilization-citizens.service';

/**
 * Root module
 *
 * Includes all project dependencies and setup options
 */
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/api',
    }),
    ApiConfigModule,
    ScheduleModule.forRoot(),
    AutomapperModule.forRoot({
      options: [{ name: 'million-pieces', pluginInitializer: classes }],
      singular: true,
    }),
    CommandModule,
    TypeOrmModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: (configService: ApiConfigService) => configService.postgresConfig,
      inject: [ApiConfigService],
    }),
    TypeOrmModule.forFeature([
      NftSegmentRepository,
      MergedSegmentRepository,
      SegmentImageLogRepository,
      UserRepository,
      PopulationRepository,
      NftWorldRepository,
      LandsForSaleRepository,
      CivilizationSegmentRepository,
      CivilizationCaveCitizenRepository,
      CivilizationCaveRepository,
      CivilizationUserRepository,
    ]),
  ],
  controllers: [
    NftSegmentController,
    MergedSegmentController,
    SegmentLoggerController,
    UserController,
    StatsController,
    NftMetadataController,
    CivilizationMapController,
    CivilizationCavesController,
    CivilizationSegmentController,
    CivilizationUserController,
    CivilizationMetadataController,
    CivilizationClaimController,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useValue: new HttpExceptionFilter(),
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new ApiResponseInterceptor(),
    },
    StatsService,
    UserService,
    NftSegmentService,
    OpenSeaService,
    CronService,
    MergedSegmentService,
    SegmentLoggerService,
    MapProfile,
    MongoDBMigration,
    Base64ToFiles,
    LogImagesExtName,
    RemoveNonExistingFiles,
    PullNftOwners,
    GraphQLService,
    Logger,
    CivilizationCavesService,
    CivilizationMapService,
    CivilizationSegmentService,
    CivilizationUserService,
    CivilizationMetadataService,
    CivilizationClaimService,
    CivilizationGraphService,
    CivilizationCitizensService,
  ],
})
export class AppModule {
  /**
   * Module init function
   *
   * Starts npm script for typeorm migrations
   *
   * @see {@link https://orkhan.gitbook.io/typeorm/docs/migrations migrations}
   */
  static async forRoot(): Promise<void> {
    await ShellCommandUtil.exec(`npm run migration:up:${process.env.NODE_ENV}`);
  }
}
