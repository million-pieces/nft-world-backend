/* eslint-disable max-len */
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { SignatureGuard } from '../../infrastructure/middlewares/guards/signature.guard';

import { GetNftSegmentCoordinateDto } from '../../dto/nft-segments/get-nft-segment-coordinate.dto';
import { OwnerSegmentsInfoDto } from '../../dto/civilization-game/segments/owner-segments-info.dto';
import { CitizenSegmentInfoDto } from '../../dto/civilization-game/segments/citizen-segment-info.dto';
import { CivilizationSegmentService } from '../../services/civilization-game/civilization-segment.service';
import { CitizenSegmentsListDto } from '../../dto/civilization-game/segments/citizen-segments-list.dto';
import { OwnerSegmentsListDto } from '../../dto/civilization-game/segments/owner-segments-list.dto';

@Controller('game/segments')
export class CivilizationSegmentController {
  constructor(
    private readonly segmentsService: CivilizationSegmentService,
  ) {}

  @Get()
  @UseGuards(SignatureGuard)
  async getOwnerSegmentsList(@Req() req: Request): Promise<CitizenSegmentsListDto | OwnerSegmentsListDto> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.segmentsService.getSegmentsList(walletAddress);
  }

  @Get('/:coordinates')
  @UseGuards(SignatureGuard)
  async getSegmentsInfo(@Param() { coordinates }: GetNftSegmentCoordinateDto, @Req() req: Request): Promise<OwnerSegmentsInfoDto | CitizenSegmentInfoDto> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.segmentsService.getSegmentInfo(coordinates, walletAddress);
  }

  @Get('/:coordinates/visitor')
  async getSegmentVisitorsInfo(@Param() { coordinates }: GetNftSegmentCoordinateDto): Promise<CitizenSegmentInfoDto> {
    return this.segmentsService.getCitizenSegmentsInfo(coordinates, '');
  }
}
