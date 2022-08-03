import { Controller, Get, Param } from '@nestjs/common';

import { CivilizationMetadataService } from '../../services/civilization-game/civilization-metadata.service';

import { GetNftSegmentIdDto } from '../../dto/nft-segments/get-nft-segment-id.dto';

@Controller('citizen-nft')
export class CivilizationMetadataController {
  constructor(
    private readonly metadataService: CivilizationMetadataService,
  ) {}

  @Get('/:id')
  async getCitizenNftMetadata(@Param() { id }: GetNftSegmentIdDto) {
    return this.metadataService.getCitizenNFTMetadata(id);
  }
}
