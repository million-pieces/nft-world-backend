import { NftSegment } from 'src/DAL/entities/nft-segment.entity';
import { SegmentImageLogAction } from 'src/infrastructure/config/enum/segment-image-log-action.enum';

export class IImageLogInfo {
  image?: string;

  action: SegmentImageLogAction;

  walletAddress: string;

  segments: NftSegment[];
}
