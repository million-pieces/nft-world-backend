import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import pieceContractAbi from '../../../piece-contract-abi.json';

import { ApiConfigService } from '../../infrastructure/config/api-config.service';

import { UserRepository } from '../../repositories/user.repository';
import { CivilizationUserRepository } from '../../repositories/civilization-game/civilization-user-repository';

import { ErrorMessages } from '../../infrastructure/config/constants/error-messages.constant';

import { UserInfoDto } from '../../dto/civilization-game/user/user-info.dto';
import { UpdateUserDto } from '../../dto/civilization-game/user/update-user.dto';

@Injectable()
export class CivilizationUserService {
  private readonly web3: Web3 = new Web3(this.configService.infuraURI);

  private readonly pieceContract = new this.web3.eth.Contract(pieceContractAbi as AbiItem[], this.configService.pieceContractAddress);

  private readonly pieceTokensDecimal = 10e17;

  constructor(
    private readonly userRepository: UserRepository,

    private readonly configService: ApiConfigService,

    private readonly civilizationUserRepository: CivilizationUserRepository,
  ) {}

  async joinGame(walletAddress: string): Promise<void> {
    walletAddress = walletAddress.toLowerCase();

    let user = await this.userRepository.getUserByWalletAddress(walletAddress);

    if (user == null) {
      user = await this.userRepository.createUser(walletAddress);
    }

    let civUser = await this.civilizationUserRepository.getUserByWalletAddress(walletAddress);

    if (civUser == null) {
      civUser = await this.civilizationUserRepository.createUser(user);

      if (process.env.NODE_ENV === 'production') {
        civUser.balance = await this.getPieceBalance(walletAddress);
        await civUser.save();
      }

      return;
    }

    throw new BadRequestException(ErrorMessages.ALREADY_IN_GAME);
  }

  async getUserInfo(walletAddress: string): Promise<UserInfoDto> {
    walletAddress = walletAddress.toLowerCase();
    const civilizationUser = await this.civilizationUserRepository.getUserByWalletAddress(walletAddress);

    if (civilizationUser == null) {
      throw new UnauthorizedException(ErrorMessages.NOT_JOINED);
    }

    return {
      id: civilizationUser.user.id,
      walletAddress,
      role: civilizationUser.role,
      color: civilizationUser.color,
      balance: civilizationUser.balance,
    };
  }

  async updateUser(walletAddress: string, updateDto: UpdateUserDto): Promise<void> {
    walletAddress = walletAddress.toLowerCase();
    const civilizationUser = await this.civilizationUserRepository.getUserByWalletAddress(walletAddress);

    if (civilizationUser == null) {
      throw new UnauthorizedException(ErrorMessages.NOT_JOINED);
    }

    await this.civilizationUserRepository.update(civilizationUser, { ...civilizationUser, ...updateDto });
  }

  private async getPieceBalance(walletAddress: string): Promise<number> {
    const balance = await this.pieceContract.methods.balanceOf(walletAddress.toLowerCase()).call();

    return balance / this.pieceTokensDecimal;
  }
}
