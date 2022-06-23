import { Injectable } from '@nestjs/common';

import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { mapFrom, Mapper } from '@automapper/core';
import { User } from '../DAL/entities/user.entity';
import { UserInfoDto } from '../dto/user/user-info.dto';
import { NftSegment } from '../DAL/entities/nft-segment.entity';
import { GetNftSegmentsWithCustomImageDto } from '../dto/nft-segments/get-nft-segments-with-custom-image.dto';
import { GetNftSegmentWithMeta } from '../dto/nft-segments/get-nft-segment-with-meta.dto';
import { MergedSegment } from '../DAL/entities/merged-segment.entity';
import { GetMergedSegmentsDto } from '../dto/merged-segments/get-merged-segments.dto';
import { Population } from '../DAL/entities/population.entity';
import { PopulationDto } from '../dto/stats/population.dto';

/**
 * Service for mapping entities to dto.
 *
 * @see {@link https://automapperts.netlify.app/docs/nestjs/ Automapper}
 */
@Injectable()
export class MapProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.mapper = mapper;
  }

  mapProfile() {
    return () => {
      this.mapper.createMap(Population, PopulationDto);
      this.mapper.createMap(NftSegment, GetNftSegmentsWithCustomImageDto);
      this.mapper.createMap(NftSegment, GetNftSegmentWithMeta)
        .forMember(
          (dest) => dest.meta.artwork,
          mapFrom(
            (src) => src.meta.artwork,
          ),
        )
        .forMember(
          (dest) => dest.meta.country,
          mapFrom(
            (src) => src.meta.country,
          ),
        )
        .forMember(
          (dest) => dest.meta.image,
          mapFrom(
            (src) => src.meta.image,
          ),
        );

      this.mapper.createMap(MergedSegment, GetMergedSegmentsDto)
        .forMember(
          (dest) => dest.coordinates,
          mapFrom(
            (src) => src.segments.map((x) => x.coordinates).sort(),
          ),
        )
        .forMember(
          (dest) => dest.id,
          mapFrom(
            (src) => src.id,
          ),
        );
      this.mapper.createMap(User, UserInfoDto)
        .forMember(
          (dest) => dest.name,
          mapFrom(
            (src) => src?.username ?? '',
          ),
        )
        .forMember(
          (dest) => dest.avatar,
          mapFrom(
            (src) => src?.avatar ?? '',
          ),
        )
        .forMember(
          (dest) => dest.address,
          mapFrom(
            (src) => src?.walletAddress ?? '',
          ),
        )
        .forMember(
          (dest) => dest.socials.discord,
          mapFrom(
            (src) => src?.socials?.discord ?? '',
          ),
        )
        .forMember(
          (dest) => dest.socials.facebook,
          mapFrom(
            (src) => src?.socials?.facebook ?? '',
          ),
        )
        .forMember(
          (dest) => dest.socials.instagram,
          mapFrom(
            (src) => src?.socials?.instagram ?? '',
          ),
        )
        .forMember(
          (dest) => dest.socials.telegram,
          mapFrom(
            (src) => src?.socials?.telegram ?? '',
          ),
        )
        .forMember(
          (dest) => dest.socials.twitter,
          mapFrom(
            (src) => src?.socials?.twitter ?? '',
          ),
        );
    };
  }
}
