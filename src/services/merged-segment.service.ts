/* eslint-disable no-await-in-loop */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { numToX, numToY, YXToNumPair } from 'excel-coordinates';
import { In } from 'typeorm';
import path from 'path';

import fs from 'fs';
import Jimp from 'jimp';
import { v4 } from 'uuid';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

import { MergedSegmentRepository } from '../repositories/merged-segment.repository';
import { NftSegmentRepository } from '../repositories/nft-segment.repository';

import { SegmentImageLogAction } from '../infrastructure/config/enum/segment-image-log-action.enum';

import { ErrorMessages } from '../infrastructure/config/constants/error-messages.constant';

import { GetMergedSegmentsDto } from '../dto/merged-segments/get-merged-segments.dto';
import { MergedSegment } from '../DAL/entities/merged-segment.entity';
import { Point } from '../infrastructure/utils/point';

import { UpdateMergedSegmentDto } from '../dto/merged-segments/update-merged-segment.dto';

import { GraphQLService } from './graphQL.service';
import { SegmentLoggerService } from './segment-logger.service';

/**
 * Service for work with merged segments
 * It's not represent any blockchain structure.
 *
 * @remarks Merged-segments is a separate structure which includes array of base NFT segments
 */
@Injectable()
export class MergedSegmentService {
  constructor(
    private readonly mergedSegmentsRepository: MergedSegmentRepository,

    private readonly nftSegmentRepository: NftSegmentRepository,

    private readonly graphQLService: GraphQLService,

    private readonly configService: ApiConfigService,

    private readonly segmentLoggerService: SegmentLoggerService,

    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  /**
   * Method which returns all merged segments
   *
   * @returns merged segment's id, short metadata and array of NFT segment's coordinates
   */
  async getMergedSegments(): Promise<GetMergedSegmentsDto[]> {
    const segments = await this.mergedSegmentsRepository.getMergedSegments();

    return this.mapper.mapArray(segments, GetMergedSegmentsDto, MergedSegment);
  }

  /**
   * Method for retrieve full merged-segment info from database
   *
   * @param id merged-segment's id
   * @returns full merged-segment's info
   */
  async getMergedSegmentById(id: number): Promise<GetMergedSegmentsDto> {
    const segment = await this.mergedSegmentsRepository.getMergedSegmentById(id);

    if (segment == null) {
      throw new NotFoundException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    return this.mapper.map(segment, GetMergedSegmentsDto, MergedSegment);
  }

  /**
   * Method for merge NFT segment's to new merged-segment structure.
   * Merge-segments doesn't have any blockchain representation.
   *
   * @param walletAddress NFT segment's owner ETH address
   * @param coordinates NFT segment's coordinates which will be merged
   * @returns created merged segments
   *
   * @remarks segments will be merged if these conditions are met:
   * * All segment's owned by single user
   * * Segment's forms a rectangle
   * * All segment's isn't merged yet
   */
  async mergeSegments(walletAddress: string, coordinates: string[]): Promise<GetMergedSegmentsDto> {
    const isMergable = await this.isSegmentsMergable(coordinates);

    if (!isMergable) {
      throw new BadRequestException(ErrorMessages.NOT_MERGABLE);
    }

    const isOwned = await this.isOwnedByUser(walletAddress, coordinates);

    if (!isOwned) {
      throw new BadRequestException(ErrorMessages.NOT_OWNED);
    }

    const nftSegments = await this.nftSegmentRepository.find({
      where: { coordinates: In(coordinates) },
      relations: ['mergedSegment'],
    });

    if (nftSegments.some((x) => x.mergedSegment != null)) {
      throw new BadRequestException(ErrorMessages.ALREADY_MERGED);
    }

    await this.segmentLoggerService.log({
      walletAddress,
      action: SegmentImageLogAction.MERGED,
      segments: nftSegments,
    });

    const mergedSegment = await this.mergedSegmentsRepository.createMergedSegment(coordinates);
    return this.mapper.map(mergedSegment, GetMergedSegmentsDto, MergedSegment);
  }

  /**
   * Method to update merged segment metadata
   *
   * @param walletAddress merged-segment's owner wallet address
   * @param mergedSegmentId merged-segment's id
   * @param updateDto properties to update
   *
   * @remarks only merged segment's owner can update it metadata.
   */
  async updateSegment(walletAddress: string, mergedSegmentId: number, updateDto: UpdateMergedSegmentDto): Promise<void> {
    const mergedSegment = await this.mergedSegmentsRepository.getMergedSegmentById(mergedSegmentId);

    if (mergedSegment == null) {
      throw new NotFoundException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    const coordinates = mergedSegment.segments.map((x) => x.coordinates);
    const isOwned = await this.isOwnedByUser(walletAddress, coordinates);

    if (!isOwned) {
      throw new BadRequestException(ErrorMessages.NOT_OWNED);
    }

    const { siteUrl } = updateDto;

    mergedSegment.siteUrl = siteUrl;
    await this.mergedSegmentsRepository.save(mergedSegment);
  }

  /**
   * Unmerge merged-segment to single pieces.
   * Only merged-segment's owner can perform that action.
   *
   * @param walletAddress merged-segment's owner wallet address
   * @param mergedSegmentId merged-segment's id
   *
   * @remarks After segments got unmerged it's image clones to included NFT segments
   * @see {@link cloneMergedSegmentImageToChild}
   */
  async unmergeSegment(walletAddress: string, mergedSegmentId: number): Promise<void> {
    const mergedSegment = await this.mergedSegmentsRepository.getMergedSegmentById(mergedSegmentId);

    if (mergedSegment == null) {
      throw new NotFoundException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    const coordinates = mergedSegment.segments.map((x) => x.coordinates);
    const isOwned = await this.isOwnedByUser(walletAddress, coordinates);

    if (!isOwned) {
      throw new BadRequestException(ErrorMessages.NOT_OWNED);
    }

    await this.cloneMergedSegmentImageToChild(mergedSegment);

    const mergeSegmentImagePath = `./public/${this.configService.mergedSegmentImagesFolder}/${mergedSegment?.image}`;
    const mergeSegmentImageMiniPath = `./public/${this.configService.mergedSegmentImagesMiniFolder}/${mergedSegment?.imageMini}`;

    if (fs.existsSync(mergeSegmentImagePath)) {
      fs.unlinkSync(mergeSegmentImagePath);
    }

    if (fs.existsSync(mergeSegmentImageMiniPath)) {
      fs.unlinkSync(mergeSegmentImageMiniPath);
    }

    await this.segmentLoggerService.log({
      walletAddress,
      action: SegmentImageLogAction.UNMERGED,
      segments: mergedSegment.segments,
    });

    await this.mergedSegmentsRepository.remove(mergedSegment);
  }

  /**
   * Method to check is these NFT segment's are mergable
   *
   * This method creates rectangle by top left and bottom right coordinate.
   * Then it check is there all coordinates are part of created rectangle and returns true or false.
   *
   * @param coordinates NFT segment's coordinates
   * @returns is these segment's are mergable
   *
   * @remarks
   * NFT segment's coordinate represents in numeric-letters style. AA100 for example, where AA is Y and 100 is X
   *
   * This method convert letter coordinates to numeric. For example A is 1, and Z is 26.
   * In this case AA will be converted to 27, AB to 28 etc.
   */
  async isSegmentsMergable(coordinates: string[]): Promise<boolean> {
    coordinates.sort();
    const topLeftCoordinate = YXToNumPair(coordinates[0]);
    const topLeftPoint = new Point(topLeftCoordinate[1], topLeftCoordinate[0]);

    const bottomRightCoordinate = YXToNumPair(coordinates[coordinates.length - 1]);
    const bottomRightPoint = new Point(bottomRightCoordinate[1], bottomRightCoordinate[0]);

    const height = bottomRightPoint.y - topLeftPoint.y + 1;
    const width = bottomRightPoint.x - topLeftPoint.x + 1;

    let countedSegments = 0;

    for (let { x } = topLeftPoint; x < topLeftPoint.x + width; x += 1) {
      for (let { y } = topLeftPoint; y < topLeftPoint.y + height; y += 1) {
        const coordinate = numToY(y) + numToX(x);

        const existingCoordinate = coordinates.find(
          (i) => i === coordinate,
        );

        if (existingCoordinate == null) {
          return false;
        }

        countedSegments += 1;
      }
    }

    if (countedSegments !== coordinates.length) {
      return false;
    }

    return true;
  }

  /**
   * Upload image on merged-segment and store it in directory set at .env file.
   * Also creates mini version of uploaded image for better productivity
   *
   * @param id merged-segment's id
   * @param walletAddress merged-segment's owner wallet address
   * @param image image's file data. When method starts execution it's already saved on system.
   *
   * @remarks
   * * Only owner can upload images on merged-segment
   * * Mini version of image also transforms to suit proportionally to merged-segment's rectangle
   * * Duplicate uploaded image in image-logs directory (set in .env file) and
   * create image log with UPLOADED type
   *
   * @see {@link SegmentLoggerService}
   *
   */
  async uploadSegmentImage(id: number, walletAddress: string, image: Express.Multer.File): Promise<void> {
    const imageMiniName = `${v4()}-${new Date().toISOString()}-mini.png`;
    const imageMiniPath = `./public/${this.configService.mergedSegmentImagesMiniFolder}/${imageMiniName}`;

    try {
      if (!fs.existsSync(image.path)) {
        throw new BadRequestException(ErrorMessages.NO_IMAGE_PROVIDED);
      }

      const mergedSegment = await this.mergedSegmentsRepository.getMergedSegmentById(id);

      if (mergedSegment == null) {
        throw new NotFoundException(ErrorMessages.SEGMENT_NOT_FOUND);
      }

      const coordinates: string[] = mergedSegment.segments.map((x) => x.coordinates);
      const isOwned = await this.isOwnedByUser(walletAddress, coordinates);

      if (!isOwned) {
        throw new BadRequestException(ErrorMessages.NOT_OWNED);
      }

      const imageMini = await this.resizeMergedSegmentImage(mergedSegment, image);
      await imageMini.writeAsync(imageMiniPath);

      this.removeSegmentImages(mergedSegment);

      mergedSegment.imageMini = imageMiniName;
      mergedSegment.image = image.filename;

      await this.mergedSegmentsRepository.save(mergedSegment);

      fs.copyFileSync(
        `./public/${this.configService.mergedSegmentImagesFolder}/${image.filename}`,
        `./public/${this.configService.logImagesFileFolder}/${image.filename}`,
      );

      await this.segmentLoggerService.log({
        image: image.filename,
        walletAddress,
        action: SegmentImageLogAction.UPLOAD,
        segments: mergedSegment.segments,
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
   * Clone image from merged-segment to included in it NFT segments
   * @param mergedSegment merged-segment's entity
   *
   * @remarks Mini version of image crops to circle, because segments has circle view on client
   */
  private async cloneMergedSegmentImageToChild(mergedSegment: MergedSegment): Promise<void> {
    const mergeSegmentImagePath = `./public/${this.configService.mergedSegmentImagesFolder}/${mergedSegment?.image}`;

    if (mergedSegment.image == null || !fs.existsSync(mergeSegmentImagePath)) {
      return;
    }

    const generatedImages: string[] = [];

    try {
      const origImageExtName = path.extname(mergeSegmentImagePath);

      for (const segment of mergedSegment.segments) {
        const newImageName = `${v4()}-${new Date().toISOString()}.${origImageExtName}`;
        const newImagePath = `./public/${this.configService.segmentImagesFolder}/${newImageName}`;

        const imageMiniName = `${segment.coordinates}-${new Date().toISOString()}-mini.png`;
        const imageMiniPath = `./public/${this.configService.segmentImagesMiniFolder}/${imageMiniName}`;

        fs.copyFileSync(mergeSegmentImagePath, newImagePath);

        const imageMini = await Jimp.read(mergeSegmentImagePath);
        await imageMini.resize(50, 50).circle().writeAsync(imageMiniPath);

        segment.image = newImageName;
        segment.imageMini = imageMiniName;

        generatedImages.push(imageMiniPath);
        generatedImages.push(newImagePath);

        await this.nftSegmentRepository.save(mergedSegment);
      }
    } catch (error) {
      for (const image of generatedImages) {
        if (fs.existsSync(image)) {
          fs.unlinkSync(image);
        }
      }

      throw new BadRequestException(error);
    }
  }

  /**
   * Method to check is all segments with required coordinates are owned by user.
   *
   * @param walletAddress user's wallet address
   * @param coordinates NFT segment's coordinate
   * @returns is all NFT segments owned by required wallet address
   */
  private async isOwnedByUser(walletAddress: string, coordinates: string[]): Promise<boolean> {
    const userGQLSegments = await this.graphQLService.getUserSegments(walletAddress.toLowerCase());

    for (const coordinate of coordinates) {
      const ownedSegment = userGQLSegments.find(
        (x) => x.coordinate === coordinate,
      );

      if (ownedSegment == null) {
        return false;
      }
    }

    return true;
  }

  /**
   * Resize mini version of merged-segment's image for its properly view on client
   *
   * @param mergedSegment merged-segment entity
   * @param image image's file data. When method starts execution it's already saved on system.
   * @returns resized image's file data
   */
  private async resizeMergedSegmentImage(mergedSegment: MergedSegment, image: Express.Multer.File): Promise<Jimp> {
    const width = this.getMergedSegmentWidth(mergedSegment);
    const height = this.getMergedSegmentHeight(mergedSegment);

    const imageMini = await Jimp.read(image.path);
    imageMini.resize(45 * width, 45 * height);

    return imageMini;
  }

  /**
   * Method which calculates new merged-segment's width
   *
   * @param mergedSegment merged-segment's entity
   * @returns merged-segment's width in NFT segments
   *
   * @remarks
   * Return width in map points. For example, if merged-segment is rectangle
   * with coordinates A1, A2, B1, B2, C1, C2 its width will be 2
   */
  private getMergedSegmentWidth(mergedSegment: MergedSegment): number {
    const topLeftPoint = YXToNumPair(mergedSegment.topLeft);
    const bottomRightPoint = YXToNumPair(mergedSegment.bottomRight);

    if (topLeftPoint[0] > bottomRightPoint[0] || topLeftPoint[1] > bottomRightPoint[1]) {
      throw new BadRequestException(ErrorMessages.INVALID_COORDINATES);
    }

    return bottomRightPoint[1] - topLeftPoint[1] + 1;
  }

  /**
   * Method which calculates new merged-segment's height
   *
   * @param mergedSegment merged-segment's entity
   * @returns merged-segment's height in NFT segments
   *
   * @remarks
   * Return height in map points. For example, if merged-segment is rectangle
   * with coordinates A1, A2, B1, B2, C1, C2 its width will be 3
   */
  private getMergedSegmentHeight(mergedSegment: MergedSegment): number {
    const topLeftPoint = YXToNumPair(mergedSegment.topLeft);
    const bottomRightPoint = YXToNumPair(mergedSegment.bottomRight);

    if (topLeftPoint[0] > bottomRightPoint[0] || topLeftPoint[1] > bottomRightPoint[1]) {
      throw new BadRequestException(ErrorMessages.INVALID_COORDINATES);
    }

    return bottomRightPoint[0] - topLeftPoint[0] + 1;
  }

  /**
   * Delete merged-segment's image and image-mini from disk.
   *
   * @param mergedSegment segment's database entity
   *
   * @private this method only uses, when new image was uploaded on merged-segment.
   *
   * @remarks doesn't update any info at database.
   * It's only clear files from disk.
   */
  private removeSegmentImages(mergedSegment: MergedSegment): void {
    const imagePath = `./public/${this.configService.mergedSegmentImagesFolder}/${mergedSegment.image}`;
    const imageMiniPath = `./public/${this.configService.mergedSegmentImagesMiniFolder}/${mergedSegment.imageMini}`;

    if (imagePath != null && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    if (imageMiniPath != null && fs.existsSync(imageMiniPath)) {
      fs.unlinkSync(imageMiniPath);
    }
  }
}
