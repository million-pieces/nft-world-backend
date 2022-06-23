import { Transform } from 'class-transformer';
import { IsEthereumAddress } from 'class-validator';

export class WalletAddressDto {
  @IsEthereumAddress()
  @Transform(({ value }) => value.toLowerCase())
    walletAddress: string;
}
