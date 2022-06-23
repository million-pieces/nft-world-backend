import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';

import fs from 'fs';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

import { UserRepository } from '../repositories/user.repository';

import { User } from '../DAL/entities/user.entity';

import { UserInfoDto } from '../dto/user/user-info.dto';
import { GetNftSegmentWithMeta } from '../dto/nft-segments/get-nft-segment-with-meta.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';

import { GraphQLService } from './graphQL.service';
import { NftSegmentService } from './nft-segment.service';

/**
 * Service for working with the users
 *
 * Stores user's info into database after profiles update. Don't save any information before that action.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly configService: ApiConfigService,

    private readonly graphQLService: GraphQLService,

    private readonly nftSegmentService: NftSegmentService,

    private readonly userRepository: UserRepository,

    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  /**
   * Method for retrieve all users information if exists.
   *
   * @param walletAddress user's ETH address in hex
   * @returns user's name, avatar and socials if exists
   */
  async getUserInfo(walletAddress: string): Promise<UserInfoDto> {
    const user = await this.userRepository.getUserByWalletAddress(walletAddress);

    return this.mapper.map(user ?? {}, UserInfoDto, User);
  }

  /**
   * Method for retrieve information about all user owned NFT segments.
   *
   * Get information from smart-contract by graphQL.
   *
   * @param walletAddress user's ETH address in hex
   * @returns array of NFT segments. Includes id, coordinate and its metadata
   *
   * @remarks returns owned segments even if user is not exists in database.
   */
  async getUserTokens(walletAddress: string): Promise<GetNftSegmentWithMeta[]> {
    const gqlSegments = await this.graphQLService.getUserSegments(walletAddress);
    const segments: GetNftSegmentWithMeta[] = [];

    for (const gqlSegment of gqlSegments) {
      const segment = await this.nftSegmentService.getSegmentByCoordinate(gqlSegment.coordinate);
      segments.push(segment);
    }

    return segments;
  }

  /**
   * Update user information in database. Create new user if not exists.
   *
   * @param walletAddress user's ETH address in hex
   * @param updateDto user's name or socials
   */
  async updateUser(walletAddress: string, updateDto: UpdateUserDto): Promise<void> {
    let user = await this.userRepository.getUserByWalletAddress(walletAddress);

    if (user == null) {
      user = await this.userRepository.createUser(walletAddress);
    }

    await this.userRepository.save({
      ...user,
      ...updateDto,
    });
  }

  /**
   * Updates user avatar. Create new user in database if not exists.
   *
   * @param walletAddress user's ETH address in hex
   * @param image image's file data. When method starts execution it's already saved on system.
   *
   * @remarks stores in folder which set at .env file
   */
  async updateAvatar(walletAddress: string, image: Express.Multer.File): Promise<void> {
    try {
      let user = await this.userRepository.getUserByWalletAddress(walletAddress);

      if (user == null) {
        user = await this.userRepository.createUser(walletAddress);
      }

      const avatarOldPath = `./public/${this.configService.usersAvatarsFolder}/${user.avatar}`;

      if (fs.existsSync(avatarOldPath)) {
        fs.unlinkSync(avatarOldPath);
      }

      user.avatar = image.filename;

      await this.userRepository.save(user);
    } catch (error) {
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }

      throw new BadRequestException(error);
    }
  }
}
