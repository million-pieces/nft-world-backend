import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';

import { CivilizationConfigService } from '../../infrastructure/config/civilization-config.service';
import { GraphQLService } from '../graphQL.service';
import { CivilizationCavesService } from './civilization-caves.service';
import { CivilizationUserService } from './civilization-user.service';
import { ColorUtil } from '../../infrastructure/utils/color.util';

import { NftSegmentRepository } from '../../repositories/nft-segment.repository';
import { UserRepository } from '../../repositories/user.repository';
import { CivilizationSegmentRepository } from '../../repositories/civilization-game/civilization-segment-repository';
import { CivilizationCaveRepository } from '../../repositories/civilization-game/civilization-cave.repository';
import { CivilizationCaveCitizenRepository } from '../../repositories/civilization-game/civilization-cave-citizen.repository';

import { ErrorMessages } from '../../infrastructure/config/constants/error-messages.constant';

import { CivilizationUserRole } from '../../infrastructure/config/enum/civilization-user-role.enum';

import { OwnerSegmentsInfoDto } from '../../dto/civilization-game/segments/owner-segments-info.dto';
import { CitizenSegmentInfoDto } from '../../dto/civilization-game/segments/citizen-segment-info.dto';
import { MapDto } from '../../dto/civilization-game/map/map.dto';
import { OwnerSegmentsListDto } from '../../dto/civilization-game/segments/owner-segments-list.dto';
import { OwnedSegmentDto } from '../../dto/civilization-game/segments/owned-segment.dto';
import { CitizenSegmentsListDto } from '../../dto/civilization-game/segments/citizen-segments-list.dto';
import { CitizenSegmentDto } from '../../dto/civilization-game/segments/citizen-segment.dto';
import { CivilizationCitizensService } from './civilization-citizens.service';

@Injectable()
export class CivilizationSegmentService {
  private readonly DAYS_PER_YEAR = 365;

  constructor(
    private readonly civilizationConfig: CivilizationConfigService,

    private readonly civilizationCitizenService: CivilizationCitizensService,

    private readonly graphQLService: GraphQLService,

    private readonly cavesService: CivilizationCavesService,

    private readonly userService: CivilizationUserService,

    private readonly segmentsRepository: NftSegmentRepository,

    private readonly userRepository: UserRepository,

    private readonly civilizationSegmentRepository: CivilizationSegmentRepository,

    private readonly civilizationCaveRepository: CivilizationCaveRepository,

    private readonly civilizationCaveCitizenRepository: CivilizationCaveCitizenRepository,
  ) {}

  async getSegmentsList(walletAddress: string): Promise<CitizenSegmentsListDto | OwnerSegmentsListDto> {
    const user = await this.userService.getUserInfo(walletAddress);

    if (user.role === CivilizationUserRole.CITIZEN) {
      return this.getCitizenSegmentsList(walletAddress);
    }

    return this.getOwnerSegmentsList(walletAddress);
  }

  private async getCitizenSegmentsList(walletAddress: string): Promise<CitizenSegmentsListDto> {
    walletAddress = walletAddress.toLowerCase();
    const caveCitizens = await this.civilizationCaveCitizenRepository.getCivilizationCavesByWalletAddress(walletAddress);

    const segments: CitizenSegmentDto[] = [];
    const uniqueSegments: number[] = [];
    let unclaimedReward = 0;

    for (const caveCitizen of caveCitizens) {
      const segment = await this.civilizationSegmentRepository.getSegmentById(caveCitizen.cave.segment.id);
      const uniqueSegment = uniqueSegments.find((e) => e === segment.segment.id);

      if (uniqueSegment == null) {
        uniqueSegments.push(segment.segment.id);
      }

      let nextRewardAt = moment(caveCitizen.lastCitizenPaymentDate).add(this.civilizationConfig.citizenRewardPeriod, 'ms').toDate();

      let isRewardAvailable = false;
      let isMaxReward = false;
      let unclaimedSegmentReward = 0;

      if (moment(nextRewardAt).isBefore(Date.now())) {
        isRewardAvailable = true;
        unclaimedSegmentReward = this.civilizationConfig.citizenRewardAmount;
        unclaimedReward += this.civilizationConfig.citizenRewardAmount;
      }

      if (moment(nextRewardAt).add(this.civilizationConfig.citizenRewardPeriod, 'ms').isBefore(Date.now())) {
        unclaimedSegmentReward = this.civilizationConfig.citizenRewardAmount;
        unclaimedReward += this.civilizationConfig.citizenRewardAmount;
        isMaxReward = true;
      }

      if (moment(nextRewardAt).isBefore(Date.now())) {
        nextRewardAt = moment(nextRewardAt).add(this.civilizationConfig.citizenRewardPeriod, 'ms').toDate();
      }

      segments.push({
        id: segment.segment.id,
        caveId: caveCitizen.cave.id,
        coordinates: segment.segment.coordinates,
        country: segment.segment.meta.country,

        nextRewardAt,
        isRewardAvailable,
        totalReward: this.civilizationConfig.citizenRewardAmount,
        unclaimedReward: unclaimedSegmentReward,
        isMaxReward,
      });
    }

    const yearlyReward = segments.length * this.civilizationConfig.citizenRewardAmount * this.DAYS_PER_YEAR;

    return {
      yearlyReward,
      citizensAmount: caveCitizens.length,
      uniqueSegmentsAmount: uniqueSegments.length,
      unclaimedReward,

      segments,
    };
  }

  private async getOwnerSegmentsList(walletAddress: string): Promise<OwnerSegmentsListDto> {
    walletAddress = walletAddress.toLowerCase();
    const segments = await this.civilizationSegmentRepository.getSegmentsByOwner(walletAddress);

    const mappedSegments: OwnedSegmentDto[] = [];

    let totalCitizens = 0;
    let cavesAmount = 0;
    let unclaimedReward = 0;

    for (const segment of segments) {
      cavesAmount += segment.caves.length;
      let currentReward = 0;

      const nextRewardAt = moment(segment.lastOwnerPaymentDate).add(this.civilizationConfig.ownerRewardPeriod, 'ms').toDate();

      let isMaxReward = false;

      if (moment(nextRewardAt).isBefore(Date.now())) {
        currentReward += this.civilizationConfig.ownerRewardAmount;
        unclaimedReward += this.civilizationConfig.ownerRewardAmount;
      }

      if (moment(nextRewardAt).add(this.civilizationConfig.ownerRewardPeriod, 'ms').isBefore(Date.now())) {
        currentReward += this.civilizationConfig.ownerRewardAmount;
        unclaimedReward += this.civilizationConfig.ownerRewardAmount;
        isMaxReward = true;
      }

      let citizensAmount = 0;

      for (const cave of segment.caves) {
        citizensAmount += cave.caveCitizens.length;
        totalCitizens += cave.caveCitizens.length;

        for (const caveCitizen of cave.caveCitizens) {
          const nextRevenueAt = moment(caveCitizen.lastRevenueCollectionDate).add(this.civilizationConfig.ownerCitizenRewardPeriod, 'ms');

          if (nextRevenueAt.isBefore(Date.now())) {
            currentReward += this.civilizationConfig.ownerCitizenRewardAmount;
            unclaimedReward += this.civilizationConfig.ownerCitizenRewardAmount;
          }
        }
      }

      mappedSegments.push({
        id: segment.segment.id,
        country: segment.segment.meta.country,
        coordinates: segment.segment.coordinates,
        nextRewardAt,

        cavesAmount: segment.caves.length,
        citizensAmount,
        currentReward,
        isMaxReward,
      });
    }

    let yearlyReward = segments.length * this.civilizationConfig.ownerRewardAmount * this.DAYS_PER_YEAR;
    yearlyReward += (totalCitizens * this.civilizationConfig.ownerCitizenRewardAmount * this.DAYS_PER_YEAR);

    return {
      segmentsAmount: segments.length,
      unclaimedReward,
      yearlyReward,
      cavesAmount,
      totalCitizens,

      segments: mappedSegments,
    };
  }

  async getSegmentsWithOwners(): Promise<MapDto[]> {
    const result: MapDto[] = [];
    const ownedSegments = await this.segmentsRepository.getOwnedSegments();

    for (const segment of ownedSegments) {
      const existingUser = result.find((e) => e.walletAddress === segment.owner.walletAddress);

      if (existingUser != null) {
        existingUser.segments.push(segment.coordinates);
      } else {
        result.push({
          walletAddress: segment.owner.walletAddress,
          color: segment.owner?.civilizationUser?.color ?? ColorUtil.generateColorByString(segment.owner.walletAddress),
          segments: [segment.coordinates],
        });
      }
    }

    return result;
  }

  async getSegmentInfo(coordinate: string, walletAddress: string): Promise<OwnerSegmentsInfoDto | CitizenSegmentInfoDto> {
    await this.updateSegmentInfo(coordinate);

    const user = await this.userService.getUserInfo(walletAddress);
    const segment = await this.segmentsRepository.getSegmentByCoordinate(coordinate);

    const civilizationSegment = await this.civilizationSegmentRepository.getSegmentByCoordinate(coordinate);

    for (const cave of civilizationSegment.caves) {
      await this.civilizationCitizenService.loadCaveCitizens(cave.id);
    }

    if (segment?.owner?.id !== user?.id) {
      return this.getCitizenSegmentsInfo(coordinate, walletAddress);
    }

    return this.getOwnerSegmentsInfo(coordinate);
  }

  async getOwnerSegmentsInfo(coordinate: string): Promise<OwnerSegmentsInfoDto> {
    const civilizationSegment = await this.civilizationSegmentRepository.getSegmentByCoordinate(coordinate);

    const { segment, lastOwnerPaymentDate } = civilizationSegment;
    const caves = await this.cavesService.getOwnedSegmentCaves(civilizationSegment);

    let yearlyReward = this.DAYS_PER_YEAR * this.civilizationConfig.ownerRewardAmount;
    let currentRewardAmount = 0;

    for (const cave of caves) {
      yearlyReward += cave.citizens.length * this.civilizationConfig.ownerCitizenRewardAmount * this.DAYS_PER_YEAR;

      currentRewardAmount += cave.totalReward;
    }

    let isRewardAvailable: boolean = false;
    let isMaxReward = false;
    const nextRewardAt: Date = moment(lastOwnerPaymentDate).add(this.civilizationConfig.ownerRewardPeriod, 'ms').toDate();

    if (moment(nextRewardAt).isBefore(Date.now())) {
      currentRewardAmount += this.civilizationConfig.ownerRewardAmount;

      isRewardAvailable = true;
    }

    if (moment(nextRewardAt).clone().add(this.civilizationConfig.ownerRewardPeriod, 'ms').isBefore(Date.now())) {
      currentRewardAmount += this.civilizationConfig.ownerRewardAmount;

      isMaxReward = true;
    }

    return {
      id: segment.id,
      coordinate: segment.coordinates,
      country: segment.meta.country,

      owner: segment.owner.walletAddress,
      username: segment.owner.username,

      yearlyReward,
      currentRewardAmount,
      isRewardAvailable,
      isMaxReward,
      nextRewardAt,

      caves,
    };
  }

  async updateUserSegments(walletAddress: string): Promise<void> {
    const segments = await this.graphQLService.getUserSegments(walletAddress);

    for (const segment of segments) {
      const nftSegment = await this.segmentsRepository.getSegmentById(Number(segment.id));
      const civSegment = await this.civilizationSegmentRepository.getSegmentByCoordinate(segment.coordinate);

      if (civSegment == null) {
        const civilizationSegment = await this.civilizationSegmentRepository.createSegment(nftSegment);
        await this.civilizationCaveRepository.createCave(civilizationSegment, 1);
      }

      let user = await this.userRepository.getUserByWalletAddress(walletAddress.toLowerCase());

      if (user == null) {
        user = await this.userRepository.createUser(walletAddress);
      }

      if (nftSegment?.owner?.id !== user?.id) {
        nftSegment.owner = user;
        await nftSegment.save();
      }
    }
  }

  async getCitizenSegmentsInfo(coordinate: string, walletAddress: string): Promise<CitizenSegmentInfoDto> {
    let civilizationSegment = await this.civilizationSegmentRepository.getSegmentByCoordinate(coordinate);
    let nftSegment = civilizationSegment?.segment;

    if (civilizationSegment == null) {
      nftSegment = await this.segmentsRepository.getSegmentByCoordinate(coordinate);

      civilizationSegment = await this.civilizationSegmentRepository.createSegment(nftSegment);

      if (nftSegment.owner != null) {
        await this.civilizationCaveRepository.createCave(civilizationSegment, 1);
        civilizationSegment = await this.civilizationSegmentRepository.getSegmentByCoordinate(coordinate);
      }
    }

    for (const cave of civilizationSegment.caves) {
      await this.civilizationCitizenService.loadCaveCitizens(cave.id);
    }

    const caves = await this.cavesService.getCitizenSegmentCaves(civilizationSegment, walletAddress);
    const yearlyReward = this.DAYS_PER_YEAR * this.civilizationConfig.citizenRewardAmount * caves.length;

    return {
      id: nftSegment.id,
      coordinate: nftSegment.coordinates,
      country: nftSegment.meta.country,

      owner: nftSegment.owner.walletAddress,
      username: nftSegment.owner.username,

      yearlyReward,

      caves,
    };
  }

  private async updateSegmentInfo(coordinate: string): Promise<void> {
    const segment = await this.segmentsRepository.getSegmentByCoordinate(coordinate);

    if (segment == null) {
      throw new BadRequestException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    const ownerWalletAddress = await this.graphQLService.getSegmentOwner(segment.id);

    if (ownerWalletAddress == null) {
      return;
    }

    let owner = await this.userRepository.getUserByWalletAddress(ownerWalletAddress.toLowerCase());

    if (owner == null) {
      owner = await this.userRepository.createUser(ownerWalletAddress.toLowerCase());
    }

    if (segment?.owner == null || segment?.owner?.walletAddress !== ownerWalletAddress) {
      segment.owner = owner;
      await segment.save();
    }

    let civilizationSegment = await this.civilizationSegmentRepository.getSegmentByCoordinate(segment.coordinates);

    if (civilizationSegment == null) {
      civilizationSegment = await this.civilizationSegmentRepository.createSegment(segment);
      await this.civilizationCaveRepository.createCave(civilizationSegment, 1);
    }
  }
}
