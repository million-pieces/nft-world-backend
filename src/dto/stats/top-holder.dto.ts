import { UserPopulationStatus } from 'src/infrastructure/config/enum/UserPopulationStatus.enum';

export class TopHolderDto {
  walletAddress: string;

  name: string;

  avatar: string;

  status: UserPopulationStatus;

  segmentsAmount: number;
}
