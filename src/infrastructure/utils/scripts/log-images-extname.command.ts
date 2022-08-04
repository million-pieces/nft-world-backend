/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-await-in-loop */
import { Command } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import fs from 'fs';

import { SegmentImageLog } from '../../../DAL/entities/segment-image-log.entity';
import { SegmentImageLogAction } from '../../config/enum/segment-image-log-action.enum';

@Injectable()
export class LogImagesExtName {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    private readonly logger: Logger,
  ) {}

  @Command({
    command: 'logImagesExtname',
    describe: 'add .jpeg extname to image logs',
  })
  async run(): Promise<void> {
    this.logger.verbose('Begin updating extname');
    await this.addExtNameToLogImages();
    this.logger.verbose('Done');

    process.exit(0);
  }

  async addExtNameToLogImages(): Promise<void> {
    const existingFiles: string[] = [];

    const queryRunner = this.connection.createQueryRunner();
    const segmentImageLogRepository = this.connection.getRepository(SegmentImageLog);

    const uploadLogs = await segmentImageLogRepository.find({ where: { action: SegmentImageLogAction.UPLOAD } });

    await queryRunner.startTransaction();

    try {
      for (const log of uploadLogs) {
        const newName = `${log.image}.jpeg`;
        existingFiles.push(newName);

        log.image = newName;

        await queryRunner.manager.save(log);
      }

      const allImages = fs.readdirSync('./public/files/log-images/');

      for (const image of allImages) {
        if (!existingFiles.includes(image)) {
          fs.unlinkSync(`./public/files/log-images/${image}`);
        }
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
