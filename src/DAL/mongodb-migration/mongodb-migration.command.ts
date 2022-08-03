/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-await-in-loop */
import { Command } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, QueryRunner } from 'typeorm';
import mongoose from 'mongoose';
import { SegmentImageLogAction } from '../../infrastructure/config/enum/segment-image-log-action.enum';
import { NftSegment } from '../entities/nft-segment.entity';
import { Socials } from '../entities/socials.entity';
import { User } from '../entities/user.entity';
import { MergedSegment } from '../entities/merged-segment.entity';
import { Population } from '../entities/population.entity';
import { SegmentImageLog } from '../entities/segment-image-log.entity';
import { NftWorld } from '../entities/nft-world.entity';
import { NftSegmentMeta } from '../entities/nft-segment-meta.entity';
import { LandsForSale } from '../entities/lands-for-sale.entity';

@Injectable()
export class MongoDBMigration {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    private readonly logger: Logger,
  ) {}

  @Command({
    command: 'migration:up:mongodb',
    describe: 'migrate mongoDB data',
  })
  async up(): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    const data = await queryRunner.query('SELECT * FROM nft_segment');

    if (data.length !== 0) {
      this.logger.verbose('Found data in DB, stopping mongodb migrations');

      process.exit(0);
    }

    await this.migratePrimaryTables();
    await this.migrateDependentTables();

    process.exit(0);
  }

  @Command({
    command: 'migration:down:mongodb',
    describe: 'migrate mongoDB data',
  })
  public async down(): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      this.logger.verbose('Begin dependent tables rollback migration');

      await queryRunner.query(`
        TRUNCATE
          lands_for_sale,
          nft_world,
          nft_segment_meta,
          nft_segment,
          socials,
          "user",
          merged_segment,
          segment_image_log,
          population
        CASCADE;
      `);

      await queryRunner.commitTransaction();

      this.logger.verbose('Successfully rollback');
    } catch (e) {
      this.logger.error(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      process.exit(0);
    }
  }

  private async migratePrimaryTables() {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      await mongoose.connect(process.env.MONGO_URI);

      this.logger.verbose('Connected to mongo database');

      await this.migrateLandsForSale(queryRunner);
      this.logger.verbose('Migrated lands for sale');

      await this.migrateSegments(queryRunner);
      this.logger.verbose('Migrated segments');

      await this.migrateNftWorld(queryRunner);
      this.logger.verbose('Migrated nft world');

      await this.migrateUsers(queryRunner);
      this.logger.verbose('Migrated users');

      await mongoose.disconnect();
      this.logger.verbose('Disconnected from mongo database');
      this.logger.verbose('Migrated primary tables');

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async migrateDependentTables() {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      await mongoose.connect(process.env.MONGO_URI);

      this.logger.verbose('Connected to mongo database');

      await this.migrateMergedSegments(queryRunner);
      this.logger.verbose('Migrated merged segments');

      await this.migrateLogs(queryRunner);
      this.logger.verbose('Migrated logs');

      await this.migratePopulation(queryRunner);
      this.logger.verbose('Migrated population');

      await mongoose.disconnect();
      this.logger.verbose('Disconnected from mongo database');
      this.logger.verbose('Migrated dependent tables');

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async migrateMergedSegments(queryRunner: QueryRunner) {
    const collection = mongoose.connection.collection('merged_segments');

    const records = await collection
      .aggregate([{
        $lookup: {
          from: 'nft_segments',
          localField: 'segments',
          foreignField: '_id',
          as: 'nft_segments_aggregate',
        },
      }])
      .toArray();

    for (const record of records) {
      const mergedSegments = new MergedSegment();

      const recordId = record._id.toString();

      mergedSegments.imageMini = record?.image_mini;
      mergedSegments.siteUrl = record?.siteUrl;
      mergedSegments.topLeft = record.topLeft;
      mergedSegments.bottomRight = record.bottomRight;

      if (record?.image_mini != null) {
        mergedSegments.image = `${recordId}.jpeg`;
      }

      await queryRunner.manager.save(mergedSegments);

      for (const nftSegment of record.nft_segments_aggregate) {
        const segment = await queryRunner.manager.findOne(NftSegment, { where: { id: nftSegment.nft_id } });
        segment.mergedSegment = mergedSegments;

        await queryRunner.manager.save(segment);
      }
    }
  }

  private async migratePopulation(queryRunner: QueryRunner) {
    const collection = mongoose.connection.collection('population');

    const records = await collection.find({}).toArray();

    for (const record of records) {
      const population = new Population();
      population.emperorUsers = [];

      for (const walletAddress of record?.emperorWallets) {
        let user = await queryRunner.manager.findOne(User, { where: { walletAddress } });

        if (user == null) {
          user = new User();
          user.walletAddress = walletAddress;

          const socials = new Socials();
          socials.user = user;

          await queryRunner.manager.save(user);
          await queryRunner.manager.save(socials);
        }

        population.emperorUsers.push(user);
      }

      population.conquerors = record?.conquerers;
      population.emperors = record?.emperors;
      population.imperialists = record?.implerialists;
      population.landowners = record?.landowners;
      population.lords = record?.lords;
      population.settlers = record?.settlers;
      population.totalOwners = record?.totalOwners;

      await queryRunner.manager.save(population);

      for (const user of population.emperorUsers) {
        user.population = population;
        await queryRunner.manager.save(user);
      }
    }
  }

  private async migrateLogs(queryRunner: QueryRunner) {
    const collection = mongoose.connection.collection('SegmentImageLogs');

    const records = await collection
      .aggregate([{
        $lookup: {
          from: 'nft_segments',
          localField: 'coordinates',
          foreignField: 'coordinates',
          as: 'nft_segments_aggregate',
        },
      }])
      .toArray();
    const queries = [];

    for (const record of records) {
      const log = new SegmentImageLog();

      log.image = record?.image;
      log.createdAt = record.timestamp;
      log.walletAddress = record?.walletAddress;
      log.segments = [];

      if (record.action === 'UPLOAD') {
        log.action = SegmentImageLogAction.UPLOAD;
      }

      if (record.action === 'MERGE') {
        log.action = SegmentImageLogAction.MERGED;
      }

      if (record.action === 'UNMERGE') {
        log.action = SegmentImageLogAction.UNMERGED;
      }

      if (record.action === 'CLAIM') {
        log.action = SegmentImageLogAction.CLAIM;
      }

      for (const nftSegment of record.nft_segments_aggregate) {
        const segment = new NftSegment();

        segment.id = nftSegment.nft_id;
        segment.coordinates = nftSegment.coordinates;
        segment.imageMini = nftSegment?.image_mini;

        log.segments.push(segment);
      }

      const query = queryRunner.manager.save(log);
      queries.push(query);
    }

    await Promise.all(queries);
  }

  private async migrateLandsForSale(queryRunner: QueryRunner) {
    const collection = mongoose.connection.collection('lands_for_sale');

    const records = await collection.find({}).toArray();
    const queries = [];

    for (const record of records) {
      const landForSale = new LandsForSale();

      landForSale.country = record.country;
      landForSale.coordinates = record.coordinates;
      landForSale.picture = record.picture;
      landForSale.link = record.link;
      landForSale.price = record.price;

      const query = queryRunner.manager.save(landForSale);
      queries.push(query);
    }

    await Promise.all(queries);
  }

  private async migrateSegments(queryRunner: QueryRunner) {
    const collection = mongoose.connection.collection('nft_segments');

    const records = await collection.find({}).toArray();
    const queries = [];

    for (const record of records) {
      const segment = new NftSegment();
      const meta = new NftSegmentMeta();

      segment.id = record.nft_id;
      segment.coordinates = record.coordinates;
      segment.imageMini = record?.image_mini;

      if (record?.image_mini != null) {
        segment.image = `${record.coordinates}.jpeg`;
      }

      meta.country = record?.meta?.country;
      meta.artwork = record?.meta?.artwork;
      meta.image = record?.meta?.image;
      meta.segment = segment;

      const query = this.saveSegmentMeta(queryRunner, segment, meta);
      queries.push(query);
    }

    await Promise.all(queries);
  }

  private async saveSegmentMeta(queryRunner: QueryRunner, segment: NftSegment, meta: NftSegmentMeta) {
    await queryRunner.manager.save(segment);
    await queryRunner.manager.save(meta);
  }

  private async migrateNftWorld(queryRunner: QueryRunner) {
    const collection = mongoose.connection.collection('nft_world');

    const records = await collection.find({}).toArray();
    const queries = [];

    for (const record of records) {
      const nftWorld = new NftWorld();

      nftWorld.value = record.value;
      nftWorld.date = new Date(record.date);

      const query = queryRunner.manager.save(nftWorld);
      queries.push(query);
    }

    await Promise.all(queries);
  }

  private async migrateUsers(queryRunner: QueryRunner) {
    const collection = mongoose.connection.collection('users');

    const records = await collection.find({}).toArray();
    const queries = [];

    for (const record of records) {
      const user = new User();

      user.avatar = record?.avatar;
      user.username = record?.username;
      user.walletAddress = record?.eth?.address;
      user.nonce = record?.nonce;
      user.claimableTokens = record?.claimableTokens;
      user.pieceBalance = record?.pieceBalance;

      const socials = new Socials();
      socials.facebook = record?.socials?.facebook;
      socials.linkedin = record?.socials?.linkedin;
      socials.instagram = record?.socials?.instagram;
      socials.twitter = record?.socials?.twitter;
      socials.discord = record?.socials?.discord;
      socials.telegram = record?.socials?.telegram;

      socials.user = user;

      const query = this.saveUserSocials(queryRunner, user, socials);
      queries.push(query);
    }

    await Promise.all(queries);
  }

  private async saveUserSocials(queryRunner: QueryRunner, user: User, socials: Socials) {
    await queryRunner.manager.save(user);
    await queryRunner.manager.save(socials);
  }
}
