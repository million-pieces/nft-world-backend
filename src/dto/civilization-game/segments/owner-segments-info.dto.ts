import { OwnedCaveDto } from '../caves/owned-cave.dto';
import { SegmentsInfoDto } from './segments-info.dto';

export class OwnerSegmentsInfoDto extends SegmentsInfoDto {
  nextRewardAt: Date;

  currentRewardAmount: number;

  isRewardAvailable: boolean;

  isMaxReward: boolean;

  caves: OwnedCaveDto[];
}
