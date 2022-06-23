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

import { MergedSegmentRepository } from './repositories/merged-segment.repository';
import { MergedSegmentService } from './services/merged-segment.service';
import { MergedSegmentController } from './controllers/merged-segment.controller';

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
    ]),
  ],
  controllers: [
    NftSegmentController,
    MergedSegmentController,
    SegmentLoggerController,
    UserController,
    StatsController,
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
    GraphQLService,
    Logger,
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
