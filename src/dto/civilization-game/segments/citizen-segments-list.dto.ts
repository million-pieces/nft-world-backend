import { CitizenSegmentDto } from './citizen-segment.dto';

export class CitizenSegmentsListDto {
  citizensAmount: number;

  uniqueSegmentsAmount: number;

  yearlyReward: number;

  unclaimedReward: number;

  segments: CitizenSegmentDto[];
}
