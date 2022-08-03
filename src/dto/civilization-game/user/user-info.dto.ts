import { CivilizationUserRole } from '../../../infrastructure/config/enum/civilization-user-role.enum';

export class UserInfoDto {
  id: number;

  walletAddress: string;

  role: CivilizationUserRole;

  color: string;

  balance: number;
}
