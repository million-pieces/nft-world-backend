export class CitizenSegmentDto {
  id: number;

  caveId: number;

  country: string;

  coordinates: string;

  totalReward: number;

  unclaimedReward: number;

  isRewardAvailable: boolean;

  isMaxReward: boolean;

  nextRewardAt: Date;
}
