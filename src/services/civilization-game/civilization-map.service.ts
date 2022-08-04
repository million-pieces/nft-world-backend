import { ForbiddenException, Injectable } from '@nestjs/common';

import { CivilizationSegmentService } from './civilization-segment.service';
import { CivilizationUserService } from './civilization-user.service';
import { GraphQLService } from '../graphQL.service';
import { CivilizationGraphService } from './civilization-graph.service';
import { CivilizationCitizensService } from './civilization-citizens.service';

import { UserRepository } from '../../repositories/user.repository';
import { NftSegmentRepository } from '../../repositories/nft-segment.repository';
import { CivilizationCaveCitizenRepository } from '../../repositories/civilization-game/civilization-cave-citizen.repository';
import { CivilizationUserRepository } from '../../repositories/civilization-game/civilization-user-repository';

import { ErrorMessages } from '../../infrastructure/config/constants/error-messages.constant';

import { CivilizationUserRole } from '../../infrastructure/config/enum/civilization-user-role.enum';

import { NftSegment } from '../../DAL/entities/nft-segment.entity';
import { CivilizationCaveCitizens } from '../../DAL/entities/civilization-game/civilization-cave-citizens.entity';

import { MapDto } from '../../dto/civilization-game/map/map.dto';

@Injectable()
export class CivilizationMapService {
  constructor(
    private readonly segmentsService: CivilizationSegmentService,

    private readonly graphQLService: GraphQLService,

    private readonly citizenGraphService: CivilizationGraphService,

    private readonly userService: CivilizationUserService,

    private readonly userRepository: UserRepository,

    private readonly civilizationUserRepository: CivilizationUserRepository,

    private readonly segmentRepository: NftSegmentRepository,

    private readonly caveCitizensRepository: CivilizationCaveCitizenRepository,

    private readonly civilizationCitizenService: CivilizationCitizensService,
  ) {}

  async getMapState(): Promise<MapDto[]> {
    return this.segmentsService.getSegmentsWithOwners();
  }

  async updateUserMap(walletAddress: string): Promise<void> {
    const citizens = await this.citizenGraphService.getUserCitizens(walletAddress.toLowerCase());
    const segments = await this.graphQLService.getUserSegments(walletAddress.toLowerCase());

    if (citizens.length !== 0 && segments.length !== 0) {
      throw new ForbiddenException(ErrorMessages.BOTH_TOKENS_OWNED);
    }

    if (citizens.length !== 0) {
      const citizenUser = await this.civilizationUserRepository.getUserByWalletAddress(walletAddress.toLowerCase());

      if (citizenUser == null) {
        let user = await this.userRepository.getUserByWalletAddress(walletAddress.toLowerCase());

        if (user == null) {
          user = await this.userRepository.getUserByWalletAddress(walletAddress.toLowerCase());
        }

        await this.civilizationUserRepository.createUser(user);
      }

      await this.userService.updateUser(walletAddress, { role: CivilizationUserRole.CITIZEN });
      await this.civilizationCitizenService.updateUserCitizens(walletAddress.toLowerCase());
    }

    if (segments.length !== 0) {
      const user = await this.userService.getUserInfo(walletAddress);

      await this.userService.updateUser(walletAddress, { role: CivilizationUserRole.OWNER });
      await this.segmentsService.updateUserSegments(user.walletAddress);
    }
  }

  async updateGlobalMapState(): Promise<void> {
    await this.nullifyOwners();
    await this.setCurrentOwners();

    await this.nullifyCitizens();
    await this.setCurrentCitizens();
  }

  private async nullifyOwners(): Promise<void> {
    const segments = await this.segmentRepository.find();
    const segmentsUpdatePromises: Promise<NftSegment>[] = [];

    for (const segment of segments) {
      segment.owner = null;

      segmentsUpdatePromises.push(segment.save());
    }

    await Promise.all(segmentsUpdatePromises);
  }

  private async nullifyCitizens(): Promise<void> {
    const caveCitizens = await this.caveCitizensRepository.find();
    const updatePromises: Promise<CivilizationCaveCitizens>[] = [];

    for (const citizen of caveCitizens) {
      citizen.citizen = null;

      updatePromises.push(citizen.save());
    }

    await Promise.all(updatePromises);
  }

  private async setCurrentCitizens(): Promise<void> {
    const citizens = await this.citizenGraphService.getAllCitizensOwners();

    for (const citizen of citizens) {
      let civilizationUser = await this.civilizationUserRepository.getUserByWalletAddress(citizen.walletAddress.toLowerCase());

      if (civilizationUser == null) {
        let user = await this.userRepository.getUserByWalletAddress(citizen.walletAddress.toLowerCase());

        if (user == null) {
          user = await this.userRepository.createUser(citizen.walletAddress.toLowerCase());
        }

        civilizationUser = await this.civilizationUserRepository.createUser(user);
      }

      for (const citizenNFT of citizen.citizens) {
        const citizenCave = await this.caveCitizensRepository.getCivilizationCavesByNftId(Number(citizenNFT.tokenId));

        if (citizenCave != null) {
          citizenCave.citizen = civilizationUser;
          await citizenCave.save();
        }
      }
    }
  }

  private async setCurrentOwners(): Promise<void> {
    const owners = await this.graphQLService.getAllSegmentsOwners();

    for (const owner of owners) {
      let user = await this.userRepository.getUserByWalletAddress(owner.walletAddress.toLowerCase());

      if (user == null) {
        user = await this.userRepository.createUser(owner.walletAddress.toLowerCase());
      }

      for (const segment of owner.segments) {
        const nftSegment = await this.segmentRepository.getSegmentById(Number(segment.id));

        nftSegment.owner = user;
        await nftSegment.save();
      }
    }
  }
}
