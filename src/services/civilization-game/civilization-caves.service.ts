/* eslint-disable max-len */
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import moment from 'moment';

import { CivilizationConfigService } from '../../infrastructure/config/civilization-config.service';

import { CivilizationCaveRepository } from '../../repositories/civilization-game/civilization-cave.repository';
import { CivilizationSegmentRepository } from '../../repositories/civilization-game/civilization-segment-repository';
import { CivilizationUserRepository } from '../../repositories/civilization-game/civilization-user-repository';
import { CivilizationCaveCitizenRepository } from '../../repositories/civilization-game/civilization-cave-citizen.repository';

import { ErrorMessages } from '../../infrastructure/config/constants/error-messages.constant';

import { CivilizationSegment } from '../../DAL/entities/civilization-game/civilization-segments.entity';
import { OwnedCaveDto } from '../../dto/civilization-game/caves/owned-cave.dto';
import { OwnedCitizenDto } from '../../dto/civilization-game/user/owned-citizen.dto';
import { CitizenCaveDto } from '../../dto/civilization-game/caves/citizen-cave.dto';

@Injectable()
export class CivilizationCavesService {
  private readonly maxCavesPerSegment = this.civilizationConfig.maxCavesPerSegment;

  constructor(
    private readonly civilizationConfig: CivilizationConfigService,

    private readonly civilizationSegmentRepository: CivilizationSegmentRepository,

    private readonly civilizationCaveRepository: CivilizationCaveRepository,

    private readonly civilizationUserRepository: CivilizationUserRepository,

    private readonly civilizationCaveCitizenRepository: CivilizationCaveCitizenRepository,
  ) {}

  async buildCave(walletAddress: string, coordinates: string, position: number): Promise<number> {
    walletAddress = walletAddress.toLowerCase();

    const civilizationSegment = await this.civilizationSegmentRepository.getSegmentByCoordinate(coordinates);
    const civilizationUser = await this.civilizationUserRepository.getUserByWalletAddress(walletAddress);

    if (civilizationSegment == null) {
      throw new BadRequestException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    if (civilizationUser == null) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }

    if (civilizationSegment.segment.owner.walletAddress !== walletAddress) {
      throw new ForbiddenException(ErrorMessages.NOT_OWNED);
    }

    if (civilizationSegment.caves.length >= this.maxCavesPerSegment) {
      throw new BadRequestException(ErrorMessages.CAVES_LIMIT);
    }

    const existingCave = civilizationSegment.caves.find((e) => e.position === position);

    if (existingCave != null) {
      throw new BadRequestException(ErrorMessages.CAVE_ALREADY_EXISTS);
    }

    if (civilizationUser.balance < this.civilizationConfig.cavePrice) {
      throw new BadRequestException(ErrorMessages.NOT_ENOUGH_TOKENS);
    }

    civilizationUser.balance -= this.civilizationConfig.cavePrice;
    await civilizationUser.save();

    const { id } = await this.civilizationCaveRepository.createCave(civilizationSegment, position);
    return id;
  }

  async getOwnedSegmentCaves(civilizationSegments: CivilizationSegment): Promise<OwnedCaveDto[]> {
    const result: OwnedCaveDto[] = [];

    for (const cave of civilizationSegments.caves) {
      const citizens: OwnedCitizenDto[] = [];
      const caveCitizens = await this.civilizationCaveCitizenRepository.getCivilizationCaveCitizensByCaveId(cave.id);
      let totalReward = 0;

      for (const citizen of caveCitizens) {
        let isRewardAvailable: boolean = false;
        let isMaxReward = false;
        let rewardAmount = 0;

        const nextRewardAt: Date = moment(citizen.lastRevenueCollectionDate).add(this.civilizationConfig.ownerCitizenRewardPeriod, 'ms').toDate();

        if (moment(nextRewardAt).isBefore(Date.now())) {
          rewardAmount += this.civilizationConfig.ownerCitizenRewardAmount;

          isRewardAvailable = true;
        }

        if (moment(nextRewardAt).clone().add(this.civilizationConfig.ownerCitizenRewardPeriod, 'ms').isBefore(Date.now())) {
          rewardAmount += this.civilizationConfig.ownerCitizenRewardAmount;

          isMaxReward = true;
        }

        totalReward += this.civilizationConfig.ownerCitizenRewardAmount;

        citizens.push({
          walletAddress: citizen.citizen.user.walletAddress,

          rewardAmount,

          nextRewardAt,
          isRewardAvailable,
          isMaxReward,

        });
      }

      result.push({
        caveId: cave.id,
        totalCitizens: citizens.length,
        totalReward,
        position: cave.position,

        citizens,
      });
    }

    return result;
  }

  async getCitizenSegmentCaves(civilizationSegments: CivilizationSegment, walletAddress: string): Promise<CitizenCaveDto[]> {
    const result: CitizenCaveDto[] = [];

    for (const cave of civilizationSegments.caves) {
      const caveCitizens = await this.civilizationCaveCitizenRepository.getCivilizationCaveCitizensByCaveId(cave.id);
      const caveCitizen = caveCitizens.find((e) => e?.citizen?.user?.walletAddress === walletAddress);

      let availableReward = 0;
      let isRewardAvailable = false;
      let isResident = false;
      let isMaxReward = false;

      let nextRewardAt: Date = null;

      if (caveCitizen != null) {
        isResident = true;

        nextRewardAt = moment(caveCitizen.lastCitizenPaymentDate).add(this.civilizationConfig.citizenRewardPeriod, 'ms').toDate();

        if (moment(nextRewardAt).isBefore(Date.now())) {
          availableReward += this.civilizationConfig.citizenRewardAmount;

          isRewardAvailable = true;
        }

        if (moment(nextRewardAt).clone().add(this.civilizationConfig.citizenRewardPeriod, 'ms').isBefore(Date.now())) {
          availableReward += this.civilizationConfig.citizenRewardAmount;

          isMaxReward = true;
        }
      }

      result.push({
        caveId: cave.id,
        totalCitizens: cave.caveCitizens.length,
        dailyReward: this.civilizationConfig.citizenRewardAmount,
        availableReward,
        position: cave.position,

        isResident,
        isRewardAvailable,
        isMaxReward,

        nextRewardAt,
      });
    }

    return result;
  }
}
