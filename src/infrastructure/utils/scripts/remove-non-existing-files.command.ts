/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-await-in-loop */
import { Command } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, Not, IsNull } from 'typeorm';
import fs from 'fs';

import { MergedSegment } from '../../../DAL/entities/merged-segment.entity';
import { NftSegment } from '../../../DAL/entities/nft-segment.entity';
import { User } from '../../../DAL/entities/user.entity';

@Injectable()
export class RemoveNonExistingFiles {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    private readonly logger: Logger,
  ) {}

  @Command({
    command: 'removeNonExistingFiles',
    describe: 'convert all base64 files from db to files',
  })
  async run(): Promise<void> {
    this.logger.verbose('Begin cleanup non-existing images from database for nft-segments');
    await this.removeSegmentsNonExistingFiles();
    this.logger.verbose('Done');

    this.logger.verbose('Begin cleanup non-existing images from database for merged segments');
    await this.removeMergedSegmentsNonExistingFiles();
    this.logger.verbose('Done');

    this.logger.verbose('Begin cleanup non-existing images from database for user-avatars');
    await this.removeNonExistingAvatars();
    this.logger.verbose('Done');

    this.logger.verbose('Begin cleanup extra files');
    await this.cleanupSegmentsExtraFiles();
    await this.cleanupMergedSegmentsExtraFiles();
    await this.cleanupUserExtraAvatars();
    this.logger.verbose('Done');

    process.exit(0);
  }

  async removeNonExistingAvatars(): Promise<void> {
    const userRepository = this.connection.getRepository(User);
    const users = await userRepository.find({ where: { avatar: Not(IsNull()) } });

    for (const user of users) {
      if (!fs.existsSync(`./public/files/users/avatars/${user.avatar}`)) {
        user.avatar = '';

        await user.save();
      }
    }
  }

  async removeSegmentsNonExistingFiles(): Promise<void> {
    const nftSegmentsRepository = this.connection.getRepository(NftSegment);
    const nftSegments = await nftSegmentsRepository.find({ where: { image: Not(IsNull()) } });

    for (const segment of nftSegments) {
      if (!fs.existsSync(`./public/files/segments/images/${segment.image}`)) {
        segment.image = null;
        segment.imageMini = null;

        await segment.save();
      }
    }
  }

  async removeMergedSegmentsNonExistingFiles(): Promise<void> {
    const mergedSegmentsRepository = this.connection.getRepository(MergedSegment);
    const mergedSegments = await mergedSegmentsRepository.find({ where: { image: Not(IsNull()) } });

    for (const segment of mergedSegments) {
      if (!fs.existsSync(`./public/files/merged-segments/images/${segment.image}`)) {
        segment.image = null;
        segment.imageMini = null;

        await segment.save();
      }
    }
  }

  async cleanupSegmentsExtraFiles(): Promise<void> {
    const usedFiles: string[] = [];

    const nftSegmentsRepository = this.connection.getRepository(NftSegment);
    const nftSegments = await nftSegmentsRepository.find({ where: { image: Not(IsNull()) } });

    for (const segment of nftSegments) {
      usedFiles.push(segment.image);
      usedFiles.push(segment.imageMini);
    }

    const allImages = fs.readdirSync('./public/files/segments/images/');

    for (const image of allImages) {
      if (!usedFiles.includes(image)) {
        fs.unlinkSync(`./public/files/segments/images/${image}`);
      }
    }

    const allImagesMini = fs.readdirSync('./public/files/segments/images-mini/');

    for (const image of allImagesMini) {
      if (!usedFiles.includes(image)) {
        fs.unlinkSync(`./public/files/segments/images-mini/${image}`);
      }
    }
  }

  async cleanupMergedSegmentsExtraFiles(): Promise<void> {
    const usedFiles: string[] = [];

    const mergedSegmentsRepository = this.connection.getRepository(MergedSegment);
    const mergedSegments = await mergedSegmentsRepository.find({ where: { image: Not(IsNull()) } });

    for (const segment of mergedSegments) {
      usedFiles.push(segment.image);
      usedFiles.push(segment.imageMini);
    }

    const allImages = fs.readdirSync('./public/files/merged-segments/images/');

    for (const image of allImages) {
      if (!usedFiles.includes(image)) {
        fs.unlinkSync(`./public/files/merged-segments/images/${image}`);
      }
    }

    const allImagesMini = fs.readdirSync('./public/files/merged-segments/images-mini/');

    for (const image of allImagesMini) {
      if (!usedFiles.includes(image)) {
        fs.unlinkSync(`./public/files/merged-segments/images-mini/${image}`);
      }
    }
  }

  async cleanupUserExtraAvatars(): Promise<void> {
    const usedFiles: string[] = [];

    const userRepository = this.connection.getRepository(User);
    const users = await userRepository.find({ where: { avatar: Not(IsNull()) } });

    for (const user of users) {
      usedFiles.push(user.avatar);
    }

    const allImages = fs.readdirSync('./public/files/users/avatars/');

    for (const image of allImages) {
      if (!usedFiles.includes(image)) {
        fs.unlinkSync(`./public/files/users/avatars/${image}`);
      }
    }
  }
}
