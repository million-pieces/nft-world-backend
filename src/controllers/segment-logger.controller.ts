/* eslint-disable max-len */
import { Controller, Get, Param, Query } from '@nestjs/common';

import { SegmentLoggerService } from 'src/services/segment-logger.service';

import { PaginationDto } from 'src/dto/generic/pagination.dto';
import { WalletAddressDto } from 'src/dto/user/wallet-address.dto';
import { SegmentImageLogDto } from 'src/dto/segment-image-logs/segment-image-log.dto';

/**
 * NFT segments action logs endpoints
 */
@Controller('logs')
export class SegmentLoggerController {
  constructor(
    private readonly segmentLoggerService: SegmentLoggerService,
  ) {}

  /**
   * Endpoint to retrieve all actions from users
   *
   * @param limit request limit
   * @param offset request offset
   * @returns logs with action creator and meta info
   */
  @Get()
  getLogs(@Query() { limit, offset }: PaginationDto): Promise<SegmentImageLogDto[]> {
    return this.segmentLoggerService.getLogs(limit, offset);
  }

  /**
   * Endpoint to retrieve all actions by single users
   *
   * @param limit request limit
   * @param offset request offset
   * @param walletAddress user's ETH wallet address
   * @returns logs of single users and its meta info
   */
  @Get('/:walletAddress')
  getLogsByWalletAddress(@Query() { limit, offset }: PaginationDto, @Param() { walletAddress }: WalletAddressDto): Promise<SegmentImageLogDto[]> {
    return this.segmentLoggerService.getLogsByWalletAddress(walletAddress, limit, offset);
  }
}
