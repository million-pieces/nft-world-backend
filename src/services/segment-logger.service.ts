import { BadRequestException, Injectable } from '@nestjs/common';

import { SegmentImageLogRepository } from 'src/repositories/segment-image-log.repository';
import { UserRepository } from 'src/repositories/user.repository';

import { SegmentImageLogDto } from 'src/dto/segment-image-logs/segment-image-log.dto';

import { IImageLogInfo } from './interface/image-log-info.interface';

import { ErrorMessages } from '../infrastructure/config/constants/error-messages.constant';

import { SegmentImageLogAction } from '../infrastructure/config/enum/segment-image-log-action.enum';

/**
 * Service for logging user's actions with segments.
 *
 * @remarks Currently has four types of logs:
 * * MERGE - on merge some NFT segments in one
 * * UNMERGE - unmerge segment to pieces
 * * UPLOAD - upload image on segment or merged-segment
 * * CLAIM (deprecated) - claim NFT segments from airdrop
 */
@Injectable()
export class SegmentLoggerService {
  constructor(
    private readonly userRepository: UserRepository,

    private readonly segmentImageLogRepository: SegmentImageLogRepository,
  ) {}

  /**
   * Log some action on database
   *
   * @param logInfo should include user's wallet address, included segments and
   * image if log type is UPLOAD
   *
   * @remarks Currently has four types of logs:
   * * MERGE - on merge some NFT segments in one
   * * UNMERGE - unmerge segment to pieces
   * * UPLOAD - upload image on segment or merged-segment
   * * CLAIM (deprecated) - claim NFT segments from airdrop
   */
  async log(logInfo: IImageLogInfo): Promise<void> {
    if (logInfo.action === SegmentImageLogAction.UPLOAD && logInfo.image == null) {
      throw new BadRequestException(ErrorMessages.BAD_LOG_TYPE);
    }

    await this.segmentImageLogRepository.createLog(logInfo);
  }

  /**
   * Get all logs with pagination.
   *
   * @param limit request limit
   * @param offset request offset
   * @returns paginated logs with type, user, included segments and image if exists
   */
  async getLogs(limit: number, offset: number): Promise<SegmentImageLogDto[]> {
    const result: SegmentImageLogDto[] = [];
    const logs = await this.segmentImageLogRepository.getLogs(limit, offset);

    for (const log of logs) {
      const coordinates = log.segments.map((segment) => segment.coordinates);
      const user = await this.userRepository.getUserByWalletAddress(log.walletAddress);

      const mappedLog: SegmentImageLogDto = {
        id: log.id,

        walletAddress: log.walletAddress,
        avatar: user?.avatar ?? '',

        coordinates,
        image: log?.image,

        action: log.action,
        createdAt: log.createdAt,
      };

      result.push(mappedLog);
    }

    return result;
  }

  /**
   * Get all logs with pagination filtered by log participant wallet address.
   *
   * @param walletAddress of participated user in log
   * @param limit request limit
   * @param offset request offset
   * @returns paginated logs with type, user, included segments and image if exists
   */
  async getLogsByWalletAddress(walletAddress: string, limit: number, offset: number): Promise<SegmentImageLogDto[]> {
    const result: SegmentImageLogDto[] = [];

    const user = await this.userRepository.getUserByWalletAddress(walletAddress);
    const logs = await this.segmentImageLogRepository.getLogsByWalletAddress(walletAddress, limit, offset);

    for (const log of logs) {
      const coordinates = log.segments.map((segment) => segment.coordinates);

      const mappedLog: SegmentImageLogDto = {
        id: log.id,

        walletAddress,
        avatar: user.avatar ?? '',

        coordinates,
        image: log?.image,

        action: log.action,
        createdAt: log.createdAt,
      };

      result.push(mappedLog);
    }

    return result;
  }
}
