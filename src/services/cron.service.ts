import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ErrorMessages } from '../infrastructure/config/constants/error-messages.constant';

import { OpenSeaService } from './opensea.service';
import { StatsService } from './stats.service';
import { CivilizationMapService } from './civilization-game/civilization-map.service';

/**
 * Cron service
 *
 * Periodically run long executing methods.
 */
@Injectable()
export class CronService {
  private readonly logger = new Logger();

  constructor(
    private readonly statsService: StatsService,

    private readonly civilizationMapService: CivilizationMapService,

    private readonly openseaService: OpenSeaService,
  ) {}

  /**
   * Updates info about total owners and their status.
   *
   * @see {@link statsService StatsService}
   *
   * @see {@link UserPopulationStatus}
   */
  @Cron('0 * * * *')
  async updatePopulation() {
    try {
      await this.statsService.updatePopulation();
    } catch (e) {
      this.logger.warn(ErrorMessages.BAD_POPULATION_UPDATE);
    }
  }

  /**
   * Update info about current total price from opensea.
   * If segment has sale orders takes it last sale price,
   * takes base price from .env file otherwise
   *
   * @see {@link openseaService OpenSeaService}
   */
  @Cron('0 12 * * *')
  async updateCurrentValue() {
    try {
      await this.openseaService.updateCurrentPrice();
    } catch (e) {
      this.logger.warn(ErrorMessages.BAD_CURRENT_PRICE_UPDATE);
    }
  }

  /**
   * Update info about current sale orders from opensea.
   *
   * @see {@link openseaService OpenSeaService}
   */
  @Cron('0 12 * * *')
  async updateLandsForSale() {
    try {
      await this.openseaService.updateLandsForSale();
    } catch (e) {
      this.logger.warn(ErrorMessages.BAD_LANDS_FOR_SALE_UPDATE);
    }
  }

  @Cron('0 * * * *')
  async updateSegmentsOwners() {
    try {
      await this.civilizationMapService.updateGlobalMapState();
    } catch (e) {
      this.logger.warn(ErrorMessages.BAD_SEGMENTS_OWNERS_UPDATE);
    }
  }
}
