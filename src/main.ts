import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiConfigService } from './infrastructure/config/api-config.service';

/**
 * Project main function
 *
 * Initialize global prefix (/api), enable cors and run forRoot AppModule function
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config: ApiConfigService = app.get(ApiConfigService);
  const { port } = config;

  await AppModule.forRoot();

  app.setGlobalPrefix('api', {
    exclude: [
      { path: '/world-in-pieces/:id', method: RequestMethod.GET },
      { path: '/citizen-nft/:id', method: RequestMethod.GET },
    ],
  });
  app.enableCors();

  await app.listen(port);
}
bootstrap();
