import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import Jimp from 'jimp';
import fs from 'fs';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

import { NftSegmentRepository } from '../repositories/nft-segment.repository';

import { NftSegment } from '../DAL/entities/nft-segment.entity';

import { SegmentImageLogAction } from '../infrastructure/config/enum/segment-image-log-action.enum';

import { ErrorMessages } from '../infrastructure/config/constants/error-messages.constant';

import { GetNftSegmentsWithCustomImageDto } from '../dto/nft-segments/get-nft-segments-with-custom-image.dto';
import { GetNftSegmentWithMeta } from '../dto/nft-segments/get-nft-segment-with-meta.dto';
import { UpdateSegmentDto } from '../dto/nft-segments/update-segment.dto';

import { GraphQLService } from './graphQL.service';
import { SegmentLoggerService } from './segment-logger.service';

/**
 * Service for working with NFT segments
 *
 * Working only with this projects segments representation.
 * Do not change or update any token metadata information
 */
@Injectable()
export class NftSegmentService {
  constructor(
    private readonly nftSegmentRepository: NftSegmentRepository,

    private readonly configService: ApiConfigService,

    private readonly graphQLService: GraphQLService,

    private readonly segmentLoggerService: SegmentLoggerService,

    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  /**
   * Get all NFT segments with custom image uploaded by user.
   *
   * @returns array of NFT segments with metadata
   */
  async getSegmentsWithCustomImage(): Promise<GetNftSegmentsWithCustomImageDto[]> {
    const segments = await this.nftSegmentRepository.getSegmentsWithCustomImage();

    return this.mapper.mapArray(segments, GetNftSegmentsWithCustomImageDto, NftSegment);
  }

  /**
   * Get NFT segment info by its coordinate
   *
   * @param coordinates NFT segment coordinate
   * @returns NFT segment with metadata
   */
  async getSegmentByCoordinate(coordinates: string): Promise<GetNftSegmentWithMeta> {
    const segment = await this.nftSegmentRepository.getSegmentByCoordinate(coordinates);

    if (segment == null) {
      throw new NotFoundException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    return this.mapper.map(segment, GetNftSegmentWithMeta, NftSegment);
  }

  /**
   * Upload image on NFT segment and store it in directory set at .env file.
   * Also creates mini version of uploaded image for better productivity
   *
   * @param coordinate NFT segment coordinate
   * @param walletAddress NFT segment owner wallet address
   * @param image image's file data. When method starts execution it's already saved on system.
   *
   * @remarks
   * * Only owner can upload images on NFT segment
   * * Mini version of image crops to circle, because segments has circle view on client
   * * Duplicate uploaded image in image-logs directory (set in .env file) and
   * create image log with UPLOADED type
   *
   * @see {@link SegmentLoggerService}
   */
  async uploadSegmentImage(coordinate: string, walletAddress: string, image: Express.Multer.File): Promise<void> {
    const imageMiniName = `${coordinate}-${new Date().toISOString()}-mini.png`;
    const imageMiniPath = `./public/${this.configService.segmentImagesMiniFolder}/${imageMiniName}`;

    try {
      if (!fs.existsSync(image.path)) {
        throw new BadRequestException(ErrorMessages.NO_IMAGE_PROVIDED);
      }

      const segment = await this.nftSegmentRepository.getSegmentByCoordinate(coordinate);
      const owner = await this.graphQLService.getSegmentOwner(segment.id);

      if (segment == null) {
        throw new NotFoundException(ErrorMessages.SEGMENT_NOT_FOUND);
      }

      if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new ForbiddenException(ErrorMessages.NOT_OWNED);
      }

      const imageMini = await Jimp.read(image.path);
      await imageMini.resize(50, 50).circle().writeAsync(imageMiniPath);

      this.removeSegmentImages(segment);

      segment.imageMini = imageMiniName;
      segment.image = image.filename;

      await this.nftSegmentRepository.save(segment);

      fs.copyFileSync(
        `./public/${this.configService.segmentImagesFolder}/${image.filename}`,
        `./public/${this.configService.logImagesFileFolder}/${image.filename}`,
      );

      await this.segmentLoggerService.log({
        image: image.filename,
        walletAddress,
        action: SegmentImageLogAction.UPLOAD,
        segments: [segment],
      });
    } catch (error) {
      if (fs.existsSync(imageMiniPath)) {
        fs.unlinkSync(imageMiniPath);
      }

      if (fs.existsSync(image?.path)) {
        fs.unlinkSync(image?.path);
      }

      throw new BadRequestException(error);
    }
  }

  /**
   * Update segments meta information.
   * Only updates this project NFT segment representation.
   * Couldn't update any NFT meta information at blockchain
   *
   * @param walletAddress segment's owner wallet address
   * @param coordinate segment's coordinate
   * @param updateDto properties which will be updated
   *
   * @remarks only segment's owner can update it
   */
  async updateSegment(walletAddress: string, coordinate: string, updateDto: UpdateSegmentDto): Promise<void> {
    const segment = await this.nftSegmentRepository.getSegmentByCoordinate(coordinate);
    const owner = await this.graphQLService.getSegmentOwner(segment.id);

    if (segment == null) {
      throw new NotFoundException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new ForbiddenException(ErrorMessages.NOT_OWNED);
    }

    const { siteUrl } = updateDto;

    segment.siteUrl = siteUrl;
    await this.nftSegmentRepository.save(segment);
  }

  /**
   * Delete segments image and image-mini from disk.
   *
   * @param segment segment's database entity
   *
   * @private this method only uses, when new image was uploaded on segment.
   *
   * @remarks doesn't update any info at database.
   * It's only clear files from disk.
   */
  private removeSegmentImages(segment: NftSegment): void {
    const imagePath = `./public/${this.configService.segmentImagesFolder}/${segment.image}`;
    const imageMiniPath = `./public/${this.configService.segmentImagesMiniFolder}/${segment.imageMini}`;

    if (imagePath != null && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    if (imageMiniPath != null && fs.existsSync(imageMiniPath)) {
      fs.unlinkSync(imageMiniPath);
    }
  }
}
