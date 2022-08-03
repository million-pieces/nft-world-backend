/* eslint-disable max-len */
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { CivilizationMapService } from '../../services/civilization-game/civilization-map.service';

import { SignatureGuard } from '../../infrastructure/middlewares/guards/signature.guard';
import { MapDto } from '../../dto/civilization-game/map/map.dto';

@Controller('game/map')
export class CivilizationMapController {
  constructor(
    private readonly mapService: CivilizationMapService,
  ) {}

  @Get()
  async getMapState(): Promise<MapDto[]> {
    return this.mapService.getMapState();
  }

  @Post()
  @UseGuards(SignatureGuard)
  async updateUsersMap(@Req() req: Request): Promise<void> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.mapService.updateUserMap(walletAddress);
  }
}
