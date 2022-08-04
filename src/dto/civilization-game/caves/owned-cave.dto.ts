import { OwnedCitizenDto } from '../user/owned-citizen.dto';

export class OwnedCaveDto {
  caveId: number;

  totalReward: number;

  totalCitizens: number;

  position: number;

  citizens: OwnedCitizenDto[];
}
