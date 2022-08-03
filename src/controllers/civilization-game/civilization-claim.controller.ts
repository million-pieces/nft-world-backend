import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { CivilizationClaimService } from '../../services/civilization-game/civilization-claim.service';

import { SignatureGuard } from '../../infrastructure/middlewares/guards/signature.guard';

import { GetNftSegmentCoordinateDto } from '../../dto/nft-segments/get-nft-segment-coordinate.dto';
import { CaveIdDto } from '../../dto/civilization-game/caves/cave-id.dto';

@Controller('game/claim')
export class CivilizationClaimController {
  constructor(
    private readonly claimService: CivilizationClaimService,
  ) {}

  @Get('/owner/total')
  @UseGuards(SignatureGuard)
  async ownerClaimTotal(@Req() req: Request): Promise<void> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.claimService.ownerClaimTotal(walletAddress);
  }

  @Get('/owner/:coordinates')
  @UseGuards(SignatureGuard)
  async ownerClaimBySegment(@Param() { coordinates }: GetNftSegmentCoordinateDto, @Req() req: Request): Promise<void> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.claimService.ownerClaimBySegment(walletAddress, coordinates);
  }

  @Get('/citizen/total')
  @UseGuards(SignatureGuard)
  async citizenClaimTotal(@Req() req: Request): Promise<void> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.claimService.citizenClaimTotal(walletAddress);
  }

  @Get('/citizen/:id')
  @UseGuards(SignatureGuard)
  async citizenClaimByCaveId(@Param() { id }: CaveIdDto, @Req() req: Request): Promise<void> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.claimService.citizenClaimByCaveId(walletAddress, id);
  }
}
