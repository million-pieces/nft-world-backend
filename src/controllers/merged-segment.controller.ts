import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';

import { SignatureGuard } from '../infrastructure/middlewares/guards/signature.guard';
import { ImageFilesInterceptor } from '../infrastructure/middlewares/interceptors/image-files.interceptor';

import { ErrorMessages } from '../infrastructure/config/constants/error-messages.constant';

import { ImageFileFolder } from '../infrastructure/config/enum/image-file-folder.enum';

import { MergedSegmentService } from '../services/merged-segment.service';

import { GetMergedSegmentsDto } from '../dto/merged-segments/get-merged-segments.dto';
import { GetMergedSegmentIdDto } from '../dto/merged-segments/get-merged-segment-id.dto';
import { GetCoordinatesDto } from '../dto/merged-segments/get-coordinates.dto';
import { UpdateMergedSegmentDto } from '../dto/merged-segments/update-merged-segment.dto';

/**
 * Merged segment's endpoints
 */
@Controller('segments-merged')
@UseInterceptors(ClassSerializerInterceptor)
export class MergedSegmentController {
  constructor(private readonly mergedSegmentsService: MergedSegmentService) {}

  /**
   * Endpoint for all merged segments on map
   *
   * @returns array of merged segments with coordinates and images
   */
  @Get()
  async getMergedSegments(): Promise<GetMergedSegmentsDto[]> {
    return this.mergedSegmentsService.getMergedSegments();
  }

  /**
   * Endpoint for check is NFT segments can be merged into rectangle
   *
   * @param coordinates array of coordinates, which will be possibly merged
   * @returns true if mergable, else otherwise
   */
  @Get('/is-mergable')
  async isSegmentsMergable(@Query() { coordinates }: GetCoordinatesDto): Promise<boolean> {
    return this.mergedSegmentsService.isSegmentsMergable(coordinates);
  }

  /**
   * Endpoint for full merged segment's info
   *
   * @param dto merged-segment's id. Provides as URL param
   * @returns merged-segment's image, image mini, id and coordinates included
   */
  @Get('/:id')
  async getMergedSegmentById(@Param() dto: GetMergedSegmentIdDto): Promise<GetMergedSegmentsDto> {
    const { id } = dto;

    return this.mergedSegmentsService.getMergedSegmentById(id);
  }

  /**
   * Endpoint to upload image on merged-segment.
   *
   * @param dto NFT segment coordinates. Provides as URL param value
   * @param files uploaded image.
   * @param request current request
   *
   * @remarks Request uses to get current user wallet address for access check
   */
  @Post('/:id/image')
  @UseGuards(SignatureGuard)
  @UseInterceptors(ImageFilesInterceptor([{ name: 'image', maxCount: 1 }], ImageFileFolder.MERGED_SEGMENT_IMAGES))
  async uploadSegmentImage(
    @Param() dto: GetMergedSegmentIdDto,
      @UploadedFiles() files: { image?: Express.Multer.File[] },
      @Req() request: Request,
  ): Promise<void> {
    const { id } = dto;
    const walletAddress = (request.headers['wallet-address'] as string).toLowerCase();

    if (files?.image == null) {
      throw new BadRequestException(ErrorMessages.NO_IMAGE_PROVIDED);
    }

    return this.mergedSegmentsService.uploadSegmentImage(id, walletAddress, files.image[0]);
  }

  /**
   * Endpoint for segments merge in a new structure, if possible
   *
   * @param coordinates array of coordinates, which will be merged
   * @param request current request
   *
   * @returns created merged-segment
   *
   * @remarks Request uses to get current user wallet address for access check
   */
  @Post()
  @UseGuards(SignatureGuard)
  async mergeSegments(@Body() { coordinates }: GetCoordinatesDto, @Req() request: Request): Promise<GetMergedSegmentsDto> {
    const walletAddress = request.headers['wallet-address'] as string;

    return this.mergedSegmentsService.mergeSegments(walletAddress, coordinates);
  }

  /**
   * Update merged-segment's meta info
   *
   * @param id merged-segment's id
   * @param dto fields which will be updated
   * @param request current request
   *
   * @remarks Request uses to get segment wallet address for access check
   */
  @Put('/:id')
  @UseGuards(SignatureGuard)
  async updateSegment(@Param() { id }: GetMergedSegmentIdDto, @Body() dto: UpdateMergedSegmentDto, @Req() request: Request): Promise<void> {
    const walletAddress = request.headers['wallet-address'] as string;

    return this.mergedSegmentsService.updateSegment(walletAddress, id, dto);
  }

  /**
   * Unmerge segments to separated pieces
   *
   * @param id merged-segment's id
   * @param request current request
   *
   * @remarks Request uses to get segment wallet address for access check
   */
  @Delete('/:id')
  @UseGuards(SignatureGuard)
  async unmergeSegments(@Param() { id }: GetMergedSegmentIdDto, @Req() request: Request): Promise<void> {
    const walletAddress = request.headers['wallet-address'] as string;

    return this.mergedSegmentsService.unmergeSegment(walletAddress, id);
  }
}
