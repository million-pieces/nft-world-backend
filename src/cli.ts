import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { AppModule } from './app.module';

/**
 * Bootstrap for nestjs-command module
 *
 * Starts some methods from *.command.ts files (stores in infrastructure/utils/scripts)
 *
 * @see {@link https://gitlab.com/aa900031/nestjs-command nestjs-command}
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'verbose'],
  });

  try {
    await app
      .select(CommandModule)
      .get(CommandService)
      .exec();

    await app.close();
  } catch (error) {
    await app.close();
    process.exit(1);
  }
}
bootstrap();
