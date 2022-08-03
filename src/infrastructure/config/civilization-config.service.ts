import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CivilizationConfigService {
  constructor(private configService: ConfigService) {}

  get ownerRewardAmount(): number {
    return Number(this.configService.get<number>('SEGMENT_OWNER_REWARD_AMOUNT'));
  }

  get ownerRewardPeriod(): number {
    return Number(this.configService.get<number>('OWNER_REWARD_PERIOD'));
  }

  get ownerCitizenRewardPeriod(): number {
    return Number(this.configService.get<number>('OWNER_CITIZEN_REWARD_PERIOD'));
  }

  get ownerCitizenRewardAmount(): number {
    return Number(this.configService.get<number>('SEGMENT_OWNER_CITIZEN_REWARD_AMOUNT'));
  }

  get ownerRevenueAlertPeriod(): number {
    return Number(this.configService.get<number>('OWNER_REVENUE_ALERT'));
  }

  get citizenRewardPeriod(): number {
    return Number(this.configService.get<number>('CITIZEN_REWARD_PERIOD'));
  }

  get citizenRewardAmount(): number {
    return Number(this.configService.get<number>('CITIZEN_REWARD_AMOUNT'));
  }

  get maxCavesPerSegment(): number {
    return Number(this.configService.get<number>('MAX_CAVES_PER_SEGMENT'));
  }

  get cavePrice(): number {
    return Number(this.configService.get<number>('CAVE_PRICE'));
  }

  get nftSegmentDescription(): string {
    return this.configService.get<string>('CITIZEN_NFT_DESCRIPTION');
  }

  get graphURI(): string {
    return this.configService.get<string>('CIVILIZATION_GRAPH_URI');
  }

  get citizenImage(): string {
    return this.configService.get<string>('CIVILIZATION_CITIZEN_IMAGE');
  }
}
