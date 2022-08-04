import { Injectable, NotFoundException } from '@nestjs/common';

import { CivilizationConfigService } from '../../infrastructure/config/civilization-config.service';

import { CivilizationCaveCitizenRepository } from '../../repositories/civilization-game/civilization-cave-citizen.repository';
import { CivilizationSegmentRepository } from '../../repositories/civilization-game/civilization-segment-repository';

import { ErrorMessages } from '../../infrastructure/config/constants/error-messages.constant';

import { CitizenMetadataDto } from '../../dto/civilization-game/metadata/citizen-metadata.dto';

@Injectable()
export class CivilizationMetadataService {
  private readonly DAYS_PER_YEAR = 365;

  constructor(
    private readonly civilizationConfigService: CivilizationConfigService,

    private readonly civilizationCaveCitizenRepository: CivilizationCaveCitizenRepository,

    private readonly civilizationSegmentRepository: CivilizationSegmentRepository,
  ) {}

  async getCitizenNFTMetadata(tokenId: number): Promise<CitizenMetadataDto> {
    const caveCitizen = await this.civilizationCaveCitizenRepository.getCivilizationCavesByNftId(tokenId);

    if (caveCitizen == null) {
      throw new NotFoundException(ErrorMessages.TOKEN_NOT_FOUND);
    }

    const segment = await this.civilizationSegmentRepository.getSegmentById(caveCitizen.cave.segment.id);

    return {
      id: tokenId,
      image: caveCitizen.nftImage,
      description: this.civilizationConfigService.nftSegmentDescription,

      attributes: [
        {
          trait_type: 'Segment ID',
          value: segment.segment.id,
        },
        {
          trait_type: 'Cave ID',
          value: caveCitizen.cave.id,
        },
        {
          trait_type: 'Income',
          value: this.civilizationConfigService.citizenRewardAmount * this.DAYS_PER_YEAR,
        },
      ],
    };
  }
}
