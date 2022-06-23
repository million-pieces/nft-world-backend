import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import Web3 from 'web3';

import { ErrorMessages } from '../../config/constants/error-messages.constant';
import { ApiConfigService } from '../../config/api-config.service';

/**
 * Middleware for unauthorized access deny.
 *
 * Client and server has same recovery message.
 * Client form some encrypted signature by user's wallet address and recovery message.
 * Then server decrypt this message and gets some wallet address.
 *
 * If decrypted wallet address and wallet address from header not the same throw exception.
 *
 * @see {@link https://web3js.readthedocs.io/en/v1.2.11/web3-eth-accounts.html#recover Web3 recover}
 */
@Injectable()
export class SignatureGuard implements CanActivate {
  private readonly web3: Web3 = new Web3(this.configService.infuraURI);

  private readonly recoveryMessage = this.web3.utils.fromUtf8(this.configService.recoveryMessage);

  constructor(private readonly configService: ApiConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const walletAddress = request.headers['wallet-address'] as string;
    const signature = request.headers.signature as string;

    if (signature == null || walletAddress == null) {
      throw new UnauthorizedException(ErrorMessages.NO_AUTH_HEADER);
    }

    try {
      const recoveredAddress = this.web3.eth.accounts.recover(
        this.recoveryMessage,
        signature,
      );

      return walletAddress.toLowerCase() === recoveredAddress.toLowerCase();
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
