import { Controller, Get } from '@nestjs/common';

import { StatsService } from '../services/stats.service';

import { PopulationDto } from '../dto/stats/population.dto';
import { TopHolderDto } from '../dto/stats/top-holder.dto';
import { RecentlyPurchasedLandDto } from '../dto/stats/recently-purchased-land.dto';
import { FeaturedSegment } from '../dto/stats/featured-segment.dto';
import { RecentlyUploadedImageDto } from '../dto/stats/recently-uploaded-image.dto';
import { PriceChangesDto } from '../dto/stats/price-changes.dto';
import { LandsForSaleDto } from '../dto/stats/lands-for-sale.dto';
import { LargestAreaDto } from '../dto/stats/largest-area.dto';

/**
 * Endpoints for projects stats
 */
@Controller('stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
  ) {}

  /**
   * Endpoint to get total owners, and owners amount by their status
   *
   * @returns total owners and owners amount by status
   *
   * @see {@link UserPopulationStatus}
   */
  @Get('/population')
  async getPopulation(): Promise<PopulationDto> {
    return this.statsService.getPopulation();
  }

  /**
   * Endpoint to get largest merged-segments
   *
   * @returns top 20 largest merged-segments and their owners
   */
  @Get('/largest-area')
  async getLargestArea(): Promise<LargestAreaDto[]> {
    return this.statsService.getLargestArea();
  }

  /**
   * Endpoint to get top NFT segment owners and their NFT segments amount
   *
   * @returns top 20 owners and amount of their segments
   */
  @Get('/top-holders')
  async getTopHolders(): Promise<TopHolderDto[]> {
    return this.statsService.getTopHolders();
  }

  /**
   * Endpoint to get info about recently purchased lands.
   * This information retrieves from blockchain
   *
   * @returns NFT segments, which was recently purchased and their new owners
   */
  @Get('/recently-purchased')
  async getRecentlyPurchasedLands(): Promise<RecentlyPurchasedLandDto[]> {
    return this.statsService.getRecentlyPurchasedLands();
  }

  /**
   * Endpoint to get random owned segment
   *
   * @returns random owned NFT segment and its owner
   */
  @Get('/featured-segment')
  async getFeaturedSegment(): Promise<FeaturedSegment> {
    return this.statsService.getFeaturedSegments();
  }

  /**
   * Endpoint to get recently uploaded images on NFT segments or merged-segments.
   * This information retrieves from {@link SegmentLoggerService}
   *
   * @returns recently uploaded images and segments on which them were uploaded
   */
  @Get('/recently-upload')
  async recentlyUploadedImages(): Promise<RecentlyUploadedImageDto[]> {
    return this.statsService.getRecentlyUploadedImages();
  }

  /**
   * Endpoint to get current total NFT segment's price and it changes
   *
   * @returns total NFT segments price and it daily and weekly changes
   */
  @Get('/price-changes')
  async getPriceChanges(): Promise<PriceChangesDto> {
    return this.statsService.getPriceChanges();
  }

  /**
   * Endpoint to get NFT segments, which currently on sale.
   * This information retrieves from {@link https://opensea.io/ OpenSea}
   *
   * @returns segments, which currently on sale and links on sale order
   */
  @Get('/lands-for-sale')
  async getLandsForSale(): Promise<LandsForSaleDto[]> {
    return this.statsService.getLandsForSale();
  }
}
