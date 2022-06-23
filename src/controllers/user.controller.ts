import { BadRequestException,
  Body, Controller, ForbiddenException, Get, Param, Put, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';

import { SignatureGuard } from '../infrastructure/middlewares/guards/signature.guard';

import { UserService } from '../services/user.service';

import { UserInfoDto } from '../dto/user/user-info.dto';
import { WalletAddressDto } from '../dto/user/wallet-address.dto';
import { GetNftSegmentWithMeta } from '../dto/nft-segments/get-nft-segment-with-meta.dto';
import { ErrorMessages } from '../infrastructure/config/constants/error-messages.constant';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { ImageFilesInterceptor } from '../infrastructure/middlewares/interceptors/image-files.interceptor';
import { ImageFileFolder } from '../infrastructure/config/enum/image-file-folder.enum';

/**
 * Endpoints for working with users
 */
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  /**
   * Endpoint for user's info.
   *
   * @param walletAddress user's wallet address
   * @returns user avatar and socials
   */
  @Get('/:walletAddress')
  async getUserInfo(@Param() { walletAddress }: WalletAddressDto): Promise<UserInfoDto> {
    return this.userService.getUserInfo(walletAddress);
  }

  /**
   * Endpoint for user's owned segments
   *
   * @param walletAddress user's wallet address
   * @param request current request
   * @returns NFT segments, which owned by current user
   *
   * @remarks Request uses to get segment wallet address for access check
   */
  @Get('/:walletAddress/segments')
  @UseGuards(SignatureGuard)
  async getUserSegments(@Param() { walletAddress }: WalletAddressDto, @Req() request: Request): Promise<GetNftSegmentWithMeta[]> {
    const currentUserAddress = (request.headers['wallet-address'] as string).toLowerCase();

    if (walletAddress !== currentUserAddress) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN);
    }

    return this.userService.getUserTokens(currentUserAddress);
  }

  /**
   * Endpoint for user's update.
   * Users are created there if they are not exists in database.
   *
   * @param walletAddress user's wallet address
   * @param dto properties for update. Username or socials
   * @param request current request
   *
   * @remarks User may not exists in database, but own NFT segments
   *
   * @remarks Request uses to get segment wallet address for access check
   */
  @Put('/:walletAddress')
  @UseGuards(SignatureGuard)
  async updateUser(@Param() { walletAddress }: WalletAddressDto, @Body() dto: UpdateUserDto, @Req() request: Request): Promise<void> {
    const currentUserAddress = (request.headers['wallet-address'] as string).toLowerCase();

    if (walletAddress !== currentUserAddress) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN);
    }

    return this.userService.updateUser(currentUserAddress, dto);
  }

  /**
   * Endpoint to upload user's avatar.
   * Users are created there if they are not exists in database.
   *
   * @param walletAddress user's wallet address.
   * @param files uploaded image.
   * @param request current request
   *
   * @remarks User may not exists in database, but own NFT segments
   *
   * @remarks Request uses to get segment wallet address for access check
   */
  @Put('/:walletAddress/avatar')
  @UseGuards(SignatureGuard)
  @UseInterceptors(ImageFilesInterceptor([{ name: 'image', maxCount: 1 }], ImageFileFolder.AVATAR_IMAGES))
  async updateAvatar(
    @Param() { walletAddress }: WalletAddressDto,
      @UploadedFiles() files: { image?: Express.Multer.File[] },
      @Req() request: Request,
  ): Promise<void> {
    const currentUserAddress = (request.headers['wallet-address'] as string).toLowerCase();

    if (walletAddress !== currentUserAddress) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN);
    }

    if (files?.image == null) {
      throw new BadRequestException(ErrorMessages.NO_IMAGE_PROVIDED);
    }

    return this.userService.updateAvatar(currentUserAddress, files.image[0]);
  }
}
