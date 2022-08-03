/* eslint-disable max-len */
import { Controller, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { CivilizationCavesService } from '../../services/civilization-game/civilization-caves.service';

import { SignatureGuard } from '../../infrastructure/middlewares/guards/signature.guard';

import { GetNftSegmentCoordinateDto } from '../../dto/nft-segments/get-nft-segment-coordinate.dto';
import { CavePositionDto } from '../../dto/civilization-game/caves/cave-position.dto';

@Controller('game/cave')
export class CivilizationCavesController {
  constructor(
    private readonly caveService: CivilizationCavesService,
  ) {}

  @Post('/:coordinates/build')
  @UseGuards(SignatureGuard)
  async joinGame(@Param() { coordinates }: GetNftSegmentCoordinateDto, @Query() { position }: CavePositionDto, @Req() req: Request): Promise<number> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.caveService.buildCave(walletAddress, coordinates, position);
  }
}
