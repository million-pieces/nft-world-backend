/* eslint-disable no-continue */
import { Injectable } from '@nestjs/common';

import { CivilizationGraphService } from './civilization-graph.service';
import { CivilizationConfigService } from '../../infrastructure/config/civilization-config.service';

import { CivilizationCaveCitizenRepository } from '../../repositories/civilization-game/civilization-cave-citizen.repository';
import { CivilizationUserRepository } from '../../repositories/civilization-game/civilization-user-repository';
import { UserRepository } from '../../repositories/user.repository';
import { CivilizationCaveRepository } from '../../repositories/civilization-game/civilization-cave.repository';

@Injectable()
export class CivilizationCitizensService {
  constructor(
    private readonly configService: CivilizationConfigService,

    private readonly citizensGraphService: CivilizationGraphService,

    private readonly userRepository: UserRepository,

    private readonly civilizationUserRepository: CivilizationUserRepository,

    private readonly cavesCitizensRepository: CivilizationCaveCitizenRepository,

    private readonly caveRepository: CivilizationCaveRepository,
  ) {}

  async loadCaveCitizens(caveId: number): Promise<void> {
    const owners = await this.citizensGraphService.getUsersByCaveId(caveId);
    const caveCitizens = await this.cavesCitizensRepository.getCivilizationCaveCitizensByCaveId(caveId);

    for (const owner of owners) {
      if (owner.citizens.length === 0) {
        continue;
      }

      const citizen = caveCitizens.find((e) => e.nftId === Number(owner.citizens[0].tokenId));

      let civilizationUser = await this.civilizationUserRepository.getUserByWalletAddress(owner.walletAddress.toLowerCase());

      if (civilizationUser == null) {
        let user = await this.userRepository.getUserByWalletAddress(owner.walletAddress.toLowerCase());

        if (user == null) {
          user = await this.userRepository.createUser(owner.walletAddress.toLowerCase());
        }

        civilizationUser = await this.civilizationUserRepository.createUser(user);
      }

      if (citizen == null) {
        const cave = await this.caveRepository.getCaveById(caveId);

        await this.cavesCitizensRepository.createCaveCitizens(
          cave,
          civilizationUser,
          Number(owner.citizens[0]?.tokenId),
          this.configService.citizenImage,
        );
      } else if (citizen?.citizen?.user?.walletAddress !== owner.walletAddress) {
        citizen.citizen = civilizationUser;
        await citizen.save();
      }
    }
  }

  async updateUserCitizens(walletAddress: string): Promise<void> {
    walletAddress = walletAddress.toLowerCase();
    const citizens = await this.citizensGraphService.getUserCitizens(walletAddress);

    let civilizationUser = await this.civilizationUserRepository.getUserByWalletAddress(walletAddress);

    if (civilizationUser == null) {
      let user = await this.userRepository.getUserByWalletAddress(walletAddress);

      if (user == null) {
        user = await this.userRepository.createUser(walletAddress);
      }

      civilizationUser = await this.civilizationUserRepository.createUser(user);
    }

    const settledCaves = await this.cavesCitizensRepository.getCivilizationCavesByWalletAddress(walletAddress);

    for (const caveCitizen of settledCaves) {
      const ownedNFT = citizens.find((e) => Number(e.tokenId) === caveCitizen.nftId);

      if (ownedNFT == null) {
        caveCitizen.citizen = null;
        await caveCitizen.save();
      }
    }

    for (const citizen of citizens) {
      const caveCitizens = await this.cavesCitizensRepository.getCivilizationCaveCitizensByCaveId(Number(citizen.caveId));
      const existingCitizen = caveCitizens.find((e) => e.citizen.user.walletAddress === walletAddress);

      if (existingCitizen == null) {
        const cave = await this.caveRepository.getCaveById(Number(citizen.caveId));

        if (cave == null) {
          continue;
        }

        const { citizenImage } = this.configService;
        await this.cavesCitizensRepository.createCaveCitizens(cave, civilizationUser, Number(citizen.tokenId), citizenImage);
      }
    }
  }
}
