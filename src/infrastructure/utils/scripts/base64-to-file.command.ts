/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-await-in-loop */
import { Command } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, Not, IsNull } from 'typeorm';
import { v4 } from 'uuid';
import fs from 'fs';

import { MergedSegment } from '../../../DAL/entities/merged-segment.entity';
import { NftSegment } from '../../../DAL/entities/nft-segment.entity';

@Injectable()
export class Base64ToFiles {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    private readonly logger: Logger,
  ) {}

  @Command({
    command: 'base64ToFile',
    describe: 'convert all base64 files from db to files',
  })
  async run(): Promise<void> {
    this.logger.verbose('Begin converting base64 segments image minis to files');
    await this.segmentMinisToFiles();
    this.logger.verbose('Done');

    this.logger.verbose('Begin converting base64 merged segments image minis to files');
    await this.mergedSegmentMinisToFiles();
    this.logger.verbose('Done');

    process.exit(0);
  }

  async mergedSegmentMinisToFiles(): Promise<void> {
    const files: string[] = [];
    const queryRunner = this.connection.createQueryRunner();
    const mergedSegmentsRepository = this.connection.getRepository(MergedSegment);

    const mergedSegments = await mergedSegmentsRepository.find({ where: { imageMini: Not(IsNull()) } });

    await queryRunner.startTransaction();

    try {
      for (const segment of mergedSegments) {
        const fileName = `${v4()}-${Date.now()}-mini.png`;
        const filePath = `./public/files/merged-segments/images-mini/${fileName}`;
        const base64Data = segment.imageMini.replace(/^data:image\/png;base64,/, '');

        fs.writeFileSync(filePath, base64Data, 'base64');
        files.push(filePath);

        segment.imageMini = fileName;

        await queryRunner.manager.save(segment);
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);

      for (const file of files) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async segmentMinisToFiles(): Promise<void> {
    const files: string[] = [];
    const queryRunner = this.connection.createQueryRunner();
    const nftSegmentsRepository = this.connection.getRepository(NftSegment);

    const nftSegments = await nftSegmentsRepository.find({ where: { imageMini: Not(IsNull()) } });

    await queryRunner.startTransaction();

    try {
      for (const segment of nftSegments) {
        const fileName = `${v4()}-${Date.now()}-mini.png`;
        const filePath = `./public/files/segments/images-mini/${fileName}`;
        const base64Data = segment.imageMini.replace(/^data:image\/png;base64,/, '');

        fs.writeFileSync(filePath, base64Data, 'base64');
        files.push(filePath);

        segment.imageMini = fileName;

        await queryRunner.manager.save(segment);
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);

      for (const file of files) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
