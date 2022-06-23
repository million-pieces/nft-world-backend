import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

import { NftWorldRepository } from '../repositories/nft-world.repository';
import { LandsForSaleRepository } from '../repositories/lands-for-sale.repository';

import { IOpenseaAsset } from './interface/opensea-asset.interface';
import { IOpenseEventsAssets } from './interface/opensea-event-asset.interface';

import { LandsForSaleDto } from '../dto/stats/lands-for-sale.dto';

/**
 * Service for retrieve information from {@link https://opensea.io/ OpenSea}
 *
 * Some methods might executes long time
 *
 * They have @remark and executes in {@link CronService}
 */
@Injectable()
export class OpenSeaService {
  private readonly axiosClient: AxiosInstance;

  private readonly openSeaLimit = 200;

  private readonly gweiPerEth = 1000000000000000000;

  constructor(
    private readonly configService: ApiConfigService,

    private readonly nftWorldRepository: NftWorldRepository,

    private readonly landsForSaleRepository: LandsForSaleRepository,
  ) {
    this.axiosClient = axios.create({
      baseURL: 'https://api.opensea.io/api/v1/',
      timeout: 50000,
      headers: {
        accept: 'application/json',
        'x-api-key': this.configService.openseaApiKey,
      },
    });
  }

  /**
   * Method which update information about NFT segments sale offers from {@link https://opensea.io/ OpenSea}
   * and save it in database
   *
   * @remarks long running method. It executes in {@link CronService}
   */
  async updateLandsForSale(): Promise<void> {
    const oldLandsForSale = await this.landsForSaleRepository.find();
    const newLandsForSale = await this.getLandsForSale();

    for (const landForSale of newLandsForSale) {
      await this.landsForSaleRepository.createLandForSale(landForSale);
    }

    await this.landsForSaleRepository.remove(oldLandsForSale);
  }

  /**
   * Method which retrieve information about NFT segments sale offers from {@link https://opensea.io/ OpenSea}
   *
   * @param landsLimit offers limit
   * @returns NFT segment meta information
   */
  async getLandsForSale(landsLimit: number = 20): Promise<LandsForSaleDto[]> {
    const totalAssets: IOpenseEventsAssets[] = await this.getAssetCreatedDutchEvents(landsLimit);

    const result: LandsForSaleDto[] = [];

    if (totalAssets.length < landsLimit) {
      landsLimit = totalAssets.length;
    }

    for (let i = 0; i < landsLimit; i += 1) {
      const splitName = totalAssets[i].asset.name.split(' ');
      const coordinates = splitName[splitName.length - 1];
      const country = splitName.filter((e) => e !== coordinates).join(' ');

      result.push({
        country,
        coordinates,
        picture: totalAssets[i].asset.image_original_url,
        link: totalAssets[i].asset.permalink,
        price: totalAssets[i].ending_price / this.gweiPerEth,
      });
    }

    return result;
  }

  /**
   * Method for update total NFT segments price and save it in database.
   * Retrieve information from {@link https://opensea.io/ OpenSea}
   *
   * @remarks long running method. It executes in {@link CronService}
   */
  async updateCurrentPrice(): Promise<void> {
    const currentPrice = await this.getCurrentPrice();
    await this.nftWorldRepository.createNftWorld(currentPrice);
  }

  /**
   * Method which retrieve current total price of all NFT segments from {@link https://opensea.io/ OpenSea}.
   *
   * If some segments didn't sales before or doesn't have sale information
   * count them with default price from .env
   *
   * @returns total price of all NFT segments
   */
  async getCurrentPrice(): Promise<number> {
    const tokensAmount = Number(this.configService.tokensAmount ?? 10000);

    let openSeaSegments = 0;
    let currentPrice = 0;

    let offset = 0;
    let assets = await this.getAssets(offset);

    while (assets.length !== 0) {
      for (let i = 0; i < assets.length; i += 1) {
        if (assets[i].last_sale !== null) {
          currentPrice += assets[i].last_sale.total_price / this.gweiPerEth;
        } else {
          currentPrice += this.configService.openseaBasePrice;
        }

        openSeaSegments += 1;
      }

      offset += this.openSeaLimit;
      assets = await this.getAssets(offset);
    }

    currentPrice += (tokensAmount - openSeaSegments) * this.configService.openseaBasePrice;
    currentPrice = Math.round(currentPrice);

    return currentPrice;
  }

  /**
   * Method which retrieve asset information from {@link https://opensea.io/ OpenSea}
   *
   * @param offset request offset
   * @param limit request limit
   * @returns array of asset objects
   *
   * @remarks retrieve only information of asset which contract address set at .env file
   *
   * @see {@link https://docs.opensea.io/reference/asset-object Asset object}
   */
  async getAssets(offset: number, limit: number = this.openSeaLimit): Promise<IOpenseaAsset[]> {
    const { data } = await this.axiosClient.get('/assets', {
      params: {
        asset_contract_address: this.configService.openseaContractAddress,
        order_by: 'sale_price',
        order_direction: 'desc',
        limit,
        offset,
      },
    });

    return data.assets;
  }

  /**
   * Method for retrieve all events of {@link https://opensea.io/ OpenSea's} asset
   *
   * @param limit assets request limit
   * @returns collection's assets events
   *
   * @see {@link https://docs.opensea.io/reference/event-object Opensea Event Model}
   */
  private async getAssetCreatedDutchEvents(limit?: number): Promise<IOpenseEventsAssets[]> {
    const events = [];

    const { data } = await this.axiosClient.get('/events', {
      params: {
        asset_contract_address: this.configService.openseaContractAddress,
        event_type: 'created',
      },
    });

    for (const event of data.asset_events) {
      if (event?.auction_type === 'dutch' && event.asset != null) {
        events.push(event);
      }
    }

    if (limit != null) {
      return events.slice(0, limit);
    }

    return events;
  }
}
