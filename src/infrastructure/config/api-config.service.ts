import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LandsForSale } from '../../DAL/entities/lands-for-sale.entity';
import { MergedSegment } from '../../DAL/entities/merged-segment.entity';
import { NftSegmentMeta } from '../../DAL/entities/nft-segment-meta.entity';
import { NftSegment } from '../../DAL/entities/nft-segment.entity';
import { NftWorld } from '../../DAL/entities/nft-world.entity';
import { Population } from '../../DAL/entities/population.entity';
import { SegmentImageLog } from '../../DAL/entities/segment-image-log.entity';
import { Socials } from '../../DAL/entities/socials.entity';
import { User } from '../../DAL/entities/user.entity';

/**
 * Service with server configuration.
 *
 * It's only retrieve information from .env file.
 * It serves for simplification working with environmental variables.
 */
@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  // App Core Preferences

  // // Port on which application running

  get port(): number {
    return this.configService.get<number>('APP_PORT');
  }

  // // Total tokens in project amount (default is 10_000)

  get tokensAmount(): number {
    return Number(this.configService.get<string>('TOKENS_AMOUNT'));
  }

  // Database Core Preferences

  // // Postgres connection preferences

  get postgresConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
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
      ],
      keepConnectionAlive: true,
      synchronize: false,
    };
  }

  // Web3 preferences

  // // Projects infura URI

  get infuraURI(): string {
    return this.configService.get<string>('INFURA_URI');
  }

  // // Recovery message uses in signature guard.

  get recoveryMessage(): string {
    return this.configService.get<string>('RECOVERY_MESSAGE');
  }

  // GraphQL preferences

  // // GraphQL URI
  // // It helps to retrieve ETH blockchain information

  get graphURI(): string {
    return this.configService.get<string>('GRAPH_URI');
  }

  // Files preferences

  get usersAvatarsFolder(): string {
    return this.configService.get<string>('USER_AVATAR_FOLDER');
  }

  get segmentImagesFolder(): string {
    return this.configService.get<string>('SEGMENT_IMAGES_FOLDER');
  }

  get segmentImagesMiniFolder(): string {
    return this.configService.get<string>('SEGMENT_IMAGES_MINI_FOLDER');
  }

  get mergedSegmentImagesFolder(): string {
    return this.configService.get<string>('MERGED_SEGMENT_IMAGES_FOLDER');
  }

  get mergedSegmentImagesMiniFolder(): string {
    return this.configService.get<string>('MERGED_SEGMENT_IMAGES_MINI_FOLDER');
  }

  // // Folder where images duplicates after being uploaded on segment or merged-segment

  get logImagesFileFolder(): string {
    return this.configService.get<string>('LOG_IMAGES_FOLDER');
  }

  // Open Sea
  // OpenSea is NFTs marketplace

  get openseaCollectionLink(): string {
    return this.configService.get<string>('OPENSEA_COLLECTION_LINK');
  }

  get openseaApiKey(): string {
    return this.configService.get<string>('OPENSEA_API_KEY');
  }

  // // Smart contract address of NFT segments

  get openseaContractAddress(): string {
    return this.configService.get<string>('OPENSEA_CONTRACT_ADDRESS');
  }

  // // Information for total NFT segments price calculation
  // // If there is no sale order on OpenSea server uses this value

  get openseaBasePrice(): number {
    return Number(this.configService.get<string>('OPENSEA_BASE_PRICE'));
  }
}
