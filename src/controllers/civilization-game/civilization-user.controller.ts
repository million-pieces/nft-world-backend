import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { CivilizationUserService } from '../../services/civilization-game/civilization-user.service';

import { SignatureGuard } from '../../infrastructure/middlewares/guards/signature.guard';

import { UserInfoDto } from '../../dto/civilization-game/user/user-info.dto';

@Controller('game/user')
export class CivilizationUserController {
  constructor(
    private readonly userService: CivilizationUserService,
  ) {}

  @Get()
  @UseGuards(SignatureGuard)
  async getUserInfo(@Req() req: Request): Promise<UserInfoDto> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.userService.getUserInfo(walletAddress);
  }

  @Post('/join')
  @UseGuards(SignatureGuard)
  async joinGame(@Req() req: Request): Promise<void> {
    const walletAddress = req.headers['wallet-address'] as string;

    return this.userService.joinGame(walletAddress);
  }
}
