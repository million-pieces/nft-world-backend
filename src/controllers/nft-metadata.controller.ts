import { Controller, Get, Param } from '@nestjs/common';
import { GetNftSegmentIdDto } from '../dto/nft-segments/get-nft-segment-id.dto';
import { NftMetadataDto } from '../dto/nft-segments/nft-metadata.dto';
import { NftSegmentService } from '../services/nft-segment.service';

@Controller()
export class NftMetadataController {
  constructor(
    private readonly segmentService: NftSegmentService,
  ) {}

  @Get('/world-in-pieces/:id')
  async getNftSegmentMetadata(@Param() { id }: GetNftSegmentIdDto): Promise<NftMetadataDto> {
    return this.segmentService.getNftMetadata(id);
  }
}
