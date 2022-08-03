/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-await-in-loop */
import { Command } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';

import { GraphQLService } from '../../../services/graphQL.service';

import { UserRepository } from '../../../repositories/user.repository';
import { NftSegmentRepository } from '../../../repositories/nft-segment.repository';

@Injectable()
export class PullNftOwners {
  constructor(
    private readonly userRepository: UserRepository,

    private readonly nftSegmentRepository: NftSegmentRepository,

    private readonly logger: Logger,

    private readonly graphService: GraphQLService,
  ) {}

  @Command({
    command: 'pullNftOwners',
    describe: 'pull nft owners info from blockchain by graphQL service',
  })
  async run(): Promise<void> {
    this.logger.verbose('Begin pulling NFT owners');
    await this.pullNftOwners();
    this.logger.verbose('Done');

    process.exit(0);
  }

  async pullNftOwners(): Promise<void> {
    const owners = await this.graphService.getAllSegmentsOwners();
    let pulledOwnersAmount = 0;

    for (const owner of owners) {
      let user = await this.userRepository.getUserByWalletAddress(owner.walletAddress);

      if (user == null) {
        user = await this.userRepository.createUser(owner.walletAddress);

        pulledOwnersAmount += 1;
      }

      for (const segment of owner.segments) {
        const nftSegment = await this.nftSegmentRepository.getSegmentById(Number(segment.id));

        nftSegment.owner = user;
        await nftSegment.save();
      }
    }

    this.logger.verbose(`Total owners pulled: ${pulledOwnersAmount}`);
  }
}
