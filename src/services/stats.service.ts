/* eslint-disable no-continue */
import { Injectable } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import SegmentsCountry from '../../SegmentsCountry.json';

import { PopulationRepository } from '../repositories/population.repository';
import { NftSegmentRepository } from '../repositories/nft-segment.repository';
import { UserRepository } from '../repositories/user.repository';
import { SegmentImageLogRepository } from '../repositories/segment-image-log.repository';
import { NftWorldRepository } from '../repositories/nft-world.repository';
import { LandsForSaleRepository } from '../repositories/lands-for-sale.repository';
import { MergedSegmentRepository } from '../repositories/merged-segment.repository';

import { Population } from '../DAL/entities/population.entity';

import { UserPopulationStatus } from '../infrastructure/config/enum/UserPopulationStatus.enum';

import { PriceChangesDto } from '../dto/stats/price-changes.dto';

import { PopulationDto } from '../dto/stats/population.dto';
import { TopHolderDto } from '../dto/stats/top-holder.dto';
import { RecentlyPurchasedLandDto } from '../dto/stats/recently-purchased-land.dto';
import { FeaturedSegment } from '../dto/stats/featured-segment.dto';
import { RecentlyUploadedImageDto } from '../dto/stats/recently-uploaded-image.dto';
import { LandsForSaleDto } from '../dto/stats/lands-for-sale.dto';
import { LargestAreaDto } from '../dto/stats/largest-area.dto';

import { GraphQLService } from './graphQL.service';
import { ApiConfigService } from '../infrastructure/config/api-config.service';

/**
 * Service which retrieve statistic information.
 *
 * Some methods might executes long time
 *
 * They have @remark and executes in {@link CronService}
 */
@Injectable()
export class StatsService {
  private countryMap = new Map<string, string[]>();

  constructor(
    private readonly configService: ApiConfigService,

    private readonly graphQLService: GraphQLService,

    private readonly populationRepository: PopulationRepository,

    private readonly userRepository: UserRepository,

    private readonly nftSegmentRepository: NftSegmentRepository,

    private readonly mergedSegmentRepository: MergedSegmentRepository,

    private readonly segmentImageLogRepository: SegmentImageLogRepository,

    private readonly nftWorldRepository: NftWorldRepository,

    private readonly landsForSaleRepository: LandsForSaleRepository,

    @InjectMapper()
    private readonly mapper: Mapper,
  ) {
    this.initCountryMap();
  }

  /**
   * Get information about NFT segments for sale.
   *
   * Information stores in database and updates everyday at 12:00 UTC
   *
   * @returns information about NFT segments for sale on {@link https://opensea.io/ OpenSea}
   *
   * @remarks method which updates information stores in {@link OpenSeaService} class
   *
   * @remarks method which executes update function stores in {@link CronService} class
   */
  async getLandsForSale(): Promise<LandsForSaleDto[]> {
    return this.landsForSaleRepository.find();
  }

  /**
   * Get information about largest merged-segments.
   *
   * @returns 20 largest merged-segments and their owners
   */
  async getLargestArea(): Promise<LargestAreaDto[]> {
    const result: LargestAreaDto[] = [];
    const nftSegmentsIds: number[] = [];

    const mergedSegments = await this.mergedSegmentRepository.getLargestMergedSegments();

    for (const mergedSegment of mergedSegments) {
      nftSegmentsIds.push(
        mergedSegment.segments[0].id,
      );
    }

    const nftOwners = await this.graphQLService.getSegmentsOwnersByIds(nftSegmentsIds);

    for (const mergedSegment of mergedSegments) {
      const { segments } = mergedSegment;

      const { owner } = nftOwners.find((segment) => segment.coordinate === segments[0].coordinates);
      const user = await this.userRepository.getUserByWalletAddress(owner.id);

      result.push({
        id: mergedSegment.id,
        segmentsAmount: mergedSegment.segments.length,
        image: mergedSegment.image,
        walletAddress: owner.id,
        avatar: user?.avatar ?? '',
        username: user?.username ?? '',
      });
    }

    return result;
  }

  /**
   * Get information about NFT segments price from database.
   * Then calculate its change for last day and week.
   *
   * @returns current NFT segments price and changes by day and week
   *
   * @remarks NFT price information retrieves from {@link https://opensea.io/ OpenSea}
   * and recalculates everyday at 12:00 UTC
   */
  async getPriceChanges(): Promise<PriceChangesDto> {
    const currentPriceEntity = await this.nftWorldRepository.getLatestValue();
    let currentPrice = currentPriceEntity?.value;

    const yesterdayPriceEntity = await this.nftWorldRepository.getYesterdayValue();
    let yesterdayPrice = yesterdayPriceEntity?.value;

    const weekAgoPriceEntity = await this.nftWorldRepository.getWeekAgoValue();
    let weekAgoPrice = weekAgoPriceEntity?.value;

    if (currentPrice == null) {
      currentPrice = this.configService.tokensAmount * this.configService.openseaBasePrice;
    }

    if (yesterdayPrice == null) {
      yesterdayPrice = this.configService.tokensAmount * this.configService.openseaBasePrice;
    }

    if (weekAgoPrice == null) {
      weekAgoPrice = this.configService.tokensAmount * this.configService.openseaBasePrice;
    }

    const dailyChanges = ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;
    const weeklyChanges = ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100;

    return {
      currentPrice,
      dailyChanges: Number(dailyChanges.toFixed(2)),
      weeklyChanges: Number(weeklyChanges.toFixed(2)),
    };
  }

  /**
   * Get information about recently purchased NFT segments.
   * Retrieve information from smart-contract by graphQL
   *
   * @returns customer information (walletAddress) and NFT segment coordinates and id
   */
  async getRecentlyPurchasedLands(): Promise<RecentlyPurchasedLandDto[]> {
    const result: RecentlyPurchasedLandDto[] = [];
    const transfers = await this.graphQLService.getTokenTransfers();

    for (const transfer of transfers) {
      const user = await this.userRepository.getUserByWalletAddress(transfer.to.id);
      const segment = await this.nftSegmentRepository.getSegmentByCoordinate(transfer.token.coordinate);

      result.push({
        walletAddress: transfer.to.id,
        avatar: user?.avatar ?? '',
        id: Number(transfer.token.id),
        coordinate: transfer.token.coordinate,
        image: segment.meta.image,
        country: segment.meta.country,
      });
    }

    return result;
  }

  /**
   * Get random owned segment with custom image from database
   *
   * @returns NFT segment coordinate and id and owner's info
   */
  async getFeaturedSegments(): Promise<FeaturedSegment> {
    const segments = await this.nftSegmentRepository.getSegmentsWithCustomImage();
    const max = segments.length;
    const min = 0;

    const randInt = Math.floor(Math.random() * (max - min) + min);
    const featuredSegment = segments[randInt];

    const walletAddress = await this.graphQLService.getSegmentOwner(featuredSegment.id);
    const user = await this.userRepository.getUserByWalletAddress(walletAddress);
    const openseaLink = `${this.configService.openseaCollectionLink}/${featuredSegment.id}`;

    return {
      id: featuredSegment.id,
      coordinates: featuredSegment.coordinates,
      image: featuredSegment.image,
      walletAddress,
      name: user?.username ?? '',
      avatar: user?.avatar ?? '',
      country: featuredSegment.meta.country,
      openseaLink,
    };
  }

  /**
   * Get top NFT segment's owners information and their status by tokens amount.
   *
   * @returns owner's information and their amount of NFT segments
   *
   * @remarks Each status, except Emperor, based on NFT segments amount.
   * Emperor status assigns if user owned all segments of some country
   *
   * @see {@link UserPopulationStatus}
   */
  async getTopHolders(): Promise<TopHolderDto[]> {
    const result: TopHolderDto[] = [];
    const owners = await this.graphQLService.getAllSegmentsOwners('DESC', 20);

    for (const owner of owners) {
      const segmentIds = owner.segments.map((e) => e.id);

      const ownerInfo = await this.userRepository.getUserByWalletAddress(owner.walletAddress);

      const status = this.getPopulationStatus(segmentIds);

      result.push({
        walletAddress: owner.walletAddress,
        name: ownerInfo?.username ?? '',
        avatar: ownerInfo?.avatar ?? '',
        status,
        segmentsAmount: segmentIds.length,
      });
    }

    return result;
  }

  /**
   * Get total owners and each status owner amount info
   *
   * @returns total owners and each status owner amount.
   *
   * @remarks Each status, except Emperor, based on NFT segments amount.
   * Emperor status assigns if user owned all segments of some country
   *
   * @see {@link UserPopulationStatus}
   */
  async getPopulation(): Promise<PopulationDto> {
    const population = await this.populationRepository.findOne();

    return this.mapper.map(population, PopulationDto, Population);
  }

  /**
   * Get recently uploaded images.
   * After upload image on segment it duplicate to folder which set at .env and logs into database.
   *
   * This method gets last 20 logs with upload status, maps and returns them.
   *
   * @returns segment (or merged-segment) owner info and uploaded image name.
   *
   * @see {@link SegmentLoggerService}
   */
  async getRecentlyUploadedImages(): Promise<RecentlyUploadedImageDto[]> {
    const result: RecentlyUploadedImageDto[] = [];
    const logs = await this.segmentImageLogRepository.getUploadLogs(20, 0);

    for (const log of logs) {
      const user = await this.userRepository.getUserByWalletAddress(log.walletAddress);
      result.push({
        image: log.image,
        walletAddress: log.walletAddress,
        avatar: user?.avatar ?? '',
        isMergedSegment: log.segments.length > 1,
        name: user?.username ?? '',
        uploadedAt: log.createdAt,
      });
    }

    return result;
  }

  /**
   * Updates total owners amount info and sort it by {@link UserPopulationStatus}.
   *
   * @remarks long-running method. It executes every hour at {@link CronService}
   */
  async updatePopulation(): Promise<void> {
    const result: PopulationDto = new PopulationDto();

    const owners = await this.graphQLService.getAllSegmentsOwners();
    result.totalOwners = owners.length;

    for (const owner of owners) {
      const segmentIds = owner.segments.map((e) => e.id);

      const status = this.getPopulationStatus(segmentIds);

      switch (status) {
        case UserPopulationStatus.Emperor:
          result.emperors += 1;
          break;
        case UserPopulationStatus.Conquerer:
          result.conquerors += 1;
          break;
        case UserPopulationStatus.Imperialist:
          result.imperialists += 1;
          break;
        case UserPopulationStatus.Landowner:
          result.landowners += 1;
          break;
        case UserPopulationStatus.Lord:
          result.lords += 1;
          break;
        case UserPopulationStatus.Settler:
          result.settlers += 1;
          break;

        default:
          break;
      }
    }

    await this.populationRepository.clear();
    await this.populationRepository.create({ ...result }).save();
  }

  /**
   * Private method to get population status by NFT segments.
   *
   * @param segmentIds id of NFT segments
   * @returns population status
   *
   * @remarks Each status, except Emperor, based on NFT segments amount.
   * Emperor status assigns if user owned all segments of some country
   *
   * @see {@link UserPopulationStatus}
   */
  private getPopulationStatus(segmentIds: string[]): UserPopulationStatus {
    let isEmperor = false;

    for (const [, ids] of this.countryMap) {
      if (this.isSuperset(segmentIds, ids)) {
        isEmperor = true;
      }
    }

    if (isEmperor) {
      return UserPopulationStatus.Emperor;
    }

    if (segmentIds.length >= 100) {
      return UserPopulationStatus.Imperialist;
    }

    if (segmentIds.length >= 30) {
      return UserPopulationStatus.Conquerer;
    }

    if (segmentIds.length >= 10) {
      return UserPopulationStatus.Lord;
    }

    if (segmentIds.length >= 5) {
      return UserPopulationStatus.Settler;
    }

    return UserPopulationStatus.Landowner;
  }

  /**
   * Helpers method.
   * At this moment in this service scope uses to find owners with Emperor status.
   *
   * It helps to find is user owned segments includes a country.
   *
   * @param set parent array of string
   * @param subSet child array of string
   * @returns is set includes all elements of subSet
   */
  private isSuperset(set: string[], subSet: string[]): boolean {
    for (const elem of subSet) {
      const index = set.findIndex((e) => e === elem);

      if (index === -1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create and save in memory (service is singleton) map where
   * key is country name, value is its country segment's coordinates.
   */
  private initCountryMap(): void {
    for (const segmentId of Object.keys(SegmentsCountry)) {
      const countryName = SegmentsCountry[segmentId];

      if (this.countryMap.get(countryName) == null) {
        this.countryMap.set(countryName, []);
      }

      this.countryMap.get(countryName).push(segmentId);
    }
  }
}
