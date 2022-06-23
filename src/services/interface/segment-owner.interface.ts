import { IGQLSegment } from './gql-segment.interface';

export class ISegmentOwner {
  walletAddress: string;

  segments: IGQLSegment[];
}
