import { EntityRepository, Repository } from 'typeorm';

import { SegmentImageLog } from 'src/DAL/entities/segment-image-log.entity';
import { IImageLogInfo } from 'src/services/interface/image-log-info.interface';
import { SegmentImageLogAction } from 'src/infrastructure/config/enum/segment-image-log-action.enum';

@EntityRepository(SegmentImageLog)
export class SegmentImageLogRepository extends Repository<SegmentImageLog> {
  async createLog(log: IImageLogInfo): Promise<SegmentImageLog> {
    const segmentImageLog = await this.create({ ...log }).save();

    return segmentImageLog;
  }

  async getLogs(limit: number, offset: number): Promise<SegmentImageLog[]> {
    return this.find({
      relations: ['segments'],

      take: limit,
      skip: offset,

      order: { createdAt: 'DESC' },
    });
  }

  async getUploadLogs(limit: number, offset: number): Promise<SegmentImageLog[]> {
    return this.find({
      where: {
        action: SegmentImageLogAction.UPLOAD,
      },

      relations: ['segments'],

      take: limit,
      skip: offset,

      order: { createdAt: 'DESC' },
    });
  }

  async getLogsByWalletAddress(walletAddress: string, limit: number, offset: number): Promise<SegmentImageLog[]> {
    return this.find({
      where: {
        walletAddress,
      },

      relations: ['segments'],

      take: limit,
      skip: offset,

      order: { createdAt: 'DESC' },
    });
  }
}
