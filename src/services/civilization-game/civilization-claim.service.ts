/* eslint-disable max-len */
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import moment from 'moment';

import { CivilizationConfigService } from '../../infrastructure/config/civilization-config.service';

import { CivilizationUserRepository } from '../../repositories/civilization-game/civilization-user-repository';
import { CivilizationSegmentRepository } from '../../repositories/civilization-game/civilization-segment-repository';
import { CivilizationCaveCitizenRepository } from '../../repositories/civilization-game/civilization-cave-citizen.repository';

import { ErrorMessages } from '../../infrastructure/config/constants/error-messages.constant';
import { CivilizationUserRole } from '../../infrastructure/config/enum/civilization-user-role.enum';

@Injectable()
export class CivilizationClaimService {
  constructor(
    private readonly civilizationConfigService: CivilizationConfigService,

    private readonly civilizationUserRepository: CivilizationUserRepository,

    private readonly civilizationSegmentRepository: CivilizationSegmentRepository,

    private readonly civilizationCaveCitizensRepository: CivilizationCaveCitizenRepository,
  ) {}

  async citizenClaimByCaveId(walletAddress: string, caveId: number): Promise<void> {
    walletAddress = walletAddress.toLowerCase();

    const caveCitizen = await this.civilizationCaveCitizensRepository.getCivilizationCaveCitizensByCaveId(caveId);
    const civilizationUser = await this.civilizationUserRepository.getUserByWalletAddress(walletAddress);

    const existingCitizen = caveCitizen.find((e) => e.citizen.user.walletAddress === walletAddress);

    if (civilizationUser == null) {
      throw new BadRequestException(ErrorMessages.NOT_JOINED);
    }

    if (existingCitizen == null) {
      throw new BadRequestException(ErrorMessages.NOT_HOSTING);
    }

    if (civilizationUser.role !== CivilizationUserRole.CITIZEN) {
      throw new ForbiddenException(ErrorMessages.NOT_ALLOWED);
    }

    let totalClaim = 0;
    const nextRewardAvailable = moment(existingCitizen.lastCitizenPaymentDate).add(this.civilizationConfigService.citizenRewardPeriod, 'ms');

    if (nextRewardAvailable.isBefore(Date.now())) {
      totalClaim += this.civilizationConfigService.citizenRewardAmount;

      existingCitizen.lastCitizenPaymentDate = new Date();
      existingCitizen.save();
    }

    if (nextRewardAvailable.add(this.civilizationConfigService.citizenRewardPeriod, 'ms').isBefore(Date.now())) {
      totalClaim += this.civilizationConfigService.citizenRewardAmount;
    }

    civilizationUser.balance += totalClaim;
    await civilizationUser.save();
  }

  async citizenClaimTotal(walletAddress: string): Promise<void> {
    walletAddress = walletAddress.toLowerCase();

    const caveCitizens = await this.civilizationCaveCitizensRepository.getCivilizationCavesByWalletAddress(walletAddress);

    for (const citizen of caveCitizens) {
      await this.citizenClaimByCaveId(walletAddress, citizen.cave.id);
    }
  }

  async ownerClaimBySegment(walletAddress: string, coordinates: string): Promise<void> {
    walletAddress = walletAddress.toLowerCase();

    const civilizationSegment = await this.civilizationSegmentRepository.getSegmentByCoordinate(coordinates);
    const civilizationUser = await this.civilizationUserRepository.getUserByWalletAddress(walletAddress);

    if (civilizationSegment == null) {
      throw new BadRequestException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    if (civilizationUser == null) {
      throw new BadRequestException(ErrorMessages.NOT_JOINED);
    }

    if (civilizationUser.role !== CivilizationUserRole.OWNER) {
      throw new ForbiddenException(ErrorMessages.NOT_ALLOWED);
    }

    if (civilizationSegment.segment.owner.walletAddress !== walletAddress) {
      throw new ForbiddenException(ErrorMessages.NOT_OWNED);
    }

    let totalClaim = 0;

    const nextClaimAt = moment(civilizationSegment.lastOwnerPaymentDate).add(this.civilizationConfigService.ownerRewardPeriod, 'ms');

    if (nextClaimAt.isBefore(Date.now())) {
      totalClaim += this.civilizationConfigService.ownerRewardAmount;

      civilizationSegment.lastOwnerPaymentDate = new Date();
      await civilizationSegment.save();
    }

    if (nextClaimAt.add(this.civilizationConfigService.ownerRewardPeriod, 'ms').isBefore(Date.now())) {
      totalClaim += this.civilizationConfigService.ownerRewardAmount;
    }

    for (const cave of civilizationSegment.caves) {
      for (const caveCitizen of cave.caveCitizens) {
        const nextRevenueAt = moment(caveCitizen.lastRevenueCollectionDate).add(this.civilizationConfigService.ownerCitizenRewardPeriod, 'ms');

        if (nextRevenueAt.isBefore(Date.now())) {
          totalClaim += this.civilizationConfigService.ownerCitizenRewardAmount;

          caveCitizen.lastRevenueCollectionDate = new Date();
          await caveCitizen.save();
        }

        if (nextRevenueAt.add(this.civilizationConfigService.ownerCitizenRewardPeriod, 'ms').isBefore(Date.now())) {
          totalClaim += this.civilizationConfigService.ownerCitizenRewardAmount;
        }
      }
    }

    civilizationUser.balance += totalClaim;
    await civilizationUser.save();
  }

  async ownerClaimTotal(walletAddress: string): Promise<void> {
    walletAddress = walletAddress.toLowerCase();

    const segments = await this.civilizationSegmentRepository.getSegmentsByOwner(walletAddress);

    for (const segment of segments) {
      await this.ownerClaimBySegment(walletAddress, segment.segment.coordinates);
    }
  }
}
