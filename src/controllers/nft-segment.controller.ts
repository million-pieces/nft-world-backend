/* eslint-disable max-len */
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor, Controller, Get, Param, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';

import { NftSegmentService } from '../services/nft-segment.service';

import { ImageFilesInterceptor } from '../infrastructure/middlewares/interceptors/image-files.interceptor';
import { SignatureGuard } from '../infrastructure/middlewares/guards/signature.guard';

import { ImageFileFolder } from '../infrastructure/config/enum/image-file-folder.enum';

import { ErrorMessages } from '../infrastructure/config/constants/error-messages.constant';

import { GetNftSegmentsWithCustomImageDto } from '../dto/nft-segments/get-nft-segments-with-custom-image.dto';
import { GetNftSegmentWithMeta } from '../dto/nft-segments/get-nft-segment-with-meta.dto';
import { GetNftSegmentCoordinateDto } from '../dto/nft-segments/get-nft-segment-coordinate.dto';
import { UpdateSegmentDto } from '../dto/nft-segments/update-segment.dto';

/**
 * NFT segment's endpoints
 */
@Controller('segments')
@UseInterceptors(ClassSerializerInterceptor)
export class NftSegmentController {
  constructor(private readonly nftSegmentService: NftSegmentService) {}

  /**
   * Endpoint for retrieve all NFT segments with image uploaded on it.
   *
   * @returns NFT segments with coordinates and uploaded images
   */
  @Get('images')
  async getSegmentsWithCustomImage(): Promise<GetNftSegmentsWithCustomImageDto[]> {
    return this.nftSegmentService.getSegmentsWithCustomImage();
  }

  /**
   * Endpoint for retrieve full information about NFT segment
   *
   * @param dto NFT segment coordinate. Provides as URL param value
   * @returns NFT segment blockchain metadata, images, and local metadata
   */
  @Get('/:coordinates')
  async getSegmentByCoordinate(@Param() dto: GetNftSegmentCoordinateDto): Promise<GetNftSegmentWithMeta> {
    const { coordinates } = dto;

    return this.nftSegmentService.getSegmentByCoordinate(coordinates);
  }

  /**
   * Endpoint to upload image on NFT segment.
   * Image updates locally, you can't update NFT image by any sources
   *
   * @param dto NFT segment coordinates. Provides as URL param value
   * @param files uploaded image.
   * @param request current request
   *
   * @remarks Request uses to get segment wallet address for access check
   */
  @Post('/:coordinates/image')
  @UseGuards(SignatureGuard)
  @UseInterceptors(ImageFilesInterceptor([{ name: 'image', maxCount: 1 }], ImageFileFolder.SEGMENT_IMAGES))
  async uploadSegmentImage(
    @Param() dto: GetNftSegmentCoordinateDto,
      @UploadedFiles() files: { image?: Express.Multer.File[] },
      @Req() request: Request,
  ): Promise<void> {
    const { coordinates } = dto;
    const walletAddress = (request.headers['wallet-address'] as string).toLowerCase();

    if (files?.image == null) {
      throw new BadRequestException(ErrorMessages.NO_IMAGE_PROVIDED);
    }

    return this.nftSegmentService.uploadSegmentImage(coordinates, walletAddress, files.image[0]);
  }

  /**
   * Endpoint to update local NFT segment's metadata.
   * NFT segment updates local metadata. You cant update
   * any NFT's data at blockchain
   *
   * @param coordinates NFT segment coordinate
   * @param dto fields, which will be updated
   * @param request current request
   *
   * @remarks Request uses to get segment wallet address for access check
   */
  @Put('/:coordinates')
  @UseGuards(SignatureGuard)
  async updateSegment(@Param() { coordinates }: GetNftSegmentCoordinateDto, @Body() dto: UpdateSegmentDto, @Req() request: Request): Promise<void> {
    const walletAddress = request.headers['wallet-address'] as string;

    return this.nftSegmentService.updateSegment(walletAddress, coordinates, dto);
  }
}
