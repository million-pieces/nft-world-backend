import { SegmentImageLogAction } from 'src/infrastructure/config/enum/segment-image-log-action.enum';

export class SegmentImageLogDto {
  id: number;

  walletAddress: string;

  avatar: string;

  action: SegmentImageLogAction;

  coordinates: string[];

  image?: string;

  createdAt: Date;
}
