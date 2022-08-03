import { OwnedSegmentDto } from './owned-segment.dto';

export class OwnerSegmentsListDto {
  segmentsAmount: number;

  cavesAmount: number;

  yearlyReward: number;

  unclaimedReward: number;

  totalCitizens: number;

  segments: OwnedSegmentDto[];
}
