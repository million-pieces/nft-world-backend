import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ApiConfigService } from './api-config.service';
import { CivilizationConfigService } from './civilization-config.service';

/**
 * Module with server configuration.
 *
 * It has global decorator, so after imports in any module
 * it's available at all project.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
  ],
  providers: [ApiConfigService, CivilizationConfigService],
  exports: [ApiConfigService, CivilizationConfigService],
})
export class ApiConfigModule {}
