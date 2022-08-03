import { IGQLCivilizationToken } from './civilization-segment.interface';

export class ICivilizationSegmentOwner {
  walletAddress: string;

  citizens: IGQLCivilizationToken[];
}
